import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUp, ArrowDown, MessageCircle, Reply, ChevronLeft, Hash, Mic, Video, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Comment {
  id: string;
  postId: string;
  parentCommentId: string | null;
  authorId: string;
  content: string;
  upvotes: number | null;
  downvotes: number | null;
  depth: number | null;
  createdAt: Date;
  updatedAt: Date;
}

function CommentThread({ comment, postId, depth = 0 }: { comment: Comment; postId: string; depth?: number }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const { data: replies = [] } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
    select: (allComments) => allComments.filter((c) => c.parentCommentId === comment.id),
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: { content, parentCommentId: comment.id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      setReplyContent("");
      setIsReplying(false);
      toast({ title: "Reply posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post reply", variant: "destructive" });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: "upvote" | "downvote") => {
      return await apiRequest(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        body: { voteType },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
    },
  });

  const handleReply = () => {
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  return (
    <div className="space-y-3" style={{ marginLeft: depth > 0 ? "2rem" : "0" }}>
      <Card className={depth > 0 ? "border-l-2 border-l-primary" : ""}>
        <CardContent className="pt-4">
          <p className="text-sm whitespace-pre-wrap mb-3">{comment.content}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteMutation.mutate("upvote")}
                disabled={!user}
                data-testid={`button-upvote-comment-${comment.id}`}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span>{(comment.upvotes || 0) - (comment.downvotes || 0)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteMutation.mutate("downvote")}
                disabled={!user}
                data-testid={`button-downvote-comment-${comment.id}`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsReplying(!isReplying)}
                data-testid={`button-reply-comment-${comment.id}`}
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>
            )}
          </div>
          {isReplying && (
            <div className="mt-3 space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                data-testid={`input-reply-${comment.id}`}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleReply}
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  data-testid={`button-submit-reply-${comment.id}`}
                >
                  Post Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {replies.map((reply) => (
        <CommentThread key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const postId = params?.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  const { data: post, isLoading } = useQuery({
    queryKey: ["/api/posts", postId],
    enabled: !!postId,
  });

  const { data: allComments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/posts", postId, "comments"],
    enabled: !!postId,
  });

  const { data: postChannels = [] } = useQuery({
    queryKey: ["/api/posts", postId, "channels"],
    enabled: !!postId,
  });

  const { data: allChannels = [] } = useQuery({
    queryKey: ["/api/unions", post?.unionId, "channels"],
    enabled: !!post?.unionId,
  });

  const topLevelComments = allComments.filter((c) => !c.parentCommentId);
  const isAuthor = user && post && user.id === post.authorId;
  const textChannels = allChannels.filter((c: any) => c.channelType === 'text');
  const untaggedChannels = textChannels.filter((c: any) => !postChannels.some((pc: any) => pc.id === c.id));

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/posts/${postId}/comments`, {
        method: "POST",
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/unions", post?.unionId, "posts"] });
      setNewComment("");
      toast({ title: "Comment posted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" });
    },
  });

  const votePostMutation = useMutation({
    mutationFn: async (voteType: "upvote" | "downvote") => {
      return await apiRequest(`/api/posts/${postId}/vote`, {
        method: "POST",
        body: { voteType },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId] });
      queryClient.invalidateQueries({ queryKey: ["/api/unions", post?.unionId, "posts"] });
    },
  });

  const tagChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return await apiRequest(`/api/posts/${postId}/channels/${channelId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/unions", post?.unionId, "posts"] });
      toast({ title: "Channel tagged!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to tag channel", variant: "destructive" });
    },
  });

  const untagChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return await apiRequest(`/api/posts/${postId}/channels/${channelId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts", postId, "channels"] });
      queryClient.invalidateQueries({ queryKey: ["/api/unions", post?.unionId, "posts"] });
      toast({ title: "Channel untagged!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to untag channel", variant: "destructive" });
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Post not found</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href={`/unions/${post.unionId}`}>
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Union
          </Button>
        </Link>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl" data-testid="post-title">{post.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4 whitespace-pre-wrap" data-testid="post-content">
              {post.content}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => votePostMutation.mutate("upvote")}
                  disabled={!user}
                  data-testid="button-upvote-post"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <span data-testid="post-score">
                  {(post.upvotes || 0) - (post.downvotes || 0)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => votePostMutation.mutate("downvote")}
                  disabled={!user}
                  data-testid="button-downvote-post"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span data-testid="comment-count">{post.commentCount || 0} comments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Channel Tags Management */}
        {postChannels.length > 0 || isAuthor ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Posted in Channels:</h3>
                {isAuthor && untaggedChannels.length > 0 && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid="button-add-channel">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Channel
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add to Channels</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2">
                          {untaggedChannels.map((channel: any) => (
                            <Button
                              key={channel.id}
                              variant="outline"
                              className="w-full justify-start"
                              onClick={() => tagChannelMutation.mutate(channel.id)}
                              disabled={tagChannelMutation.isPending}
                              data-testid={`button-tag-channel-${channel.id}`}
                            >
                              {channel.channelType === 'voice' ? <Mic className="h-4 w-4 mr-2" /> :
                               channel.channelType === 'video' ? <Video className="h-4 w-4 mr-2" /> :
                               <Hash className="h-4 w-4 mr-2" />}
                              {channel.name}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {postChannels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not posted in any channels yet.</p>
                ) : (
                  postChannels.map((channel: any) => (
                    <Badge 
                      key={channel.id} 
                      variant="secondary" 
                      className="text-sm flex items-center gap-1"
                      data-testid={`channel-tag-${channel.id}`}
                    >
                      {channel.channelType === 'voice' ? <Mic className="h-3 w-3" /> :
                       channel.channelType === 'video' ? <Video className="h-3 w-3" /> :
                       <Hash className="h-3 w-3" />}
                      {channel.name}
                      {isAuthor && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            untagChannelMutation.mutate(channel.id);
                          }}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          disabled={untagChannelMutation.isPending}
                          data-testid={`button-untag-channel-${channel.id}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {user && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                data-testid="input-new-comment"
              />
              <Button
                onClick={() => commentMutation.mutate(newComment)}
                disabled={!newComment.trim() || commentMutation.isPending}
                className="mt-3"
                data-testid="button-submit-comment"
              >
                Post Comment
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold" data-testid="comments-title">
            Comments ({topLevelComments.length})
          </h2>
          {topLevelComments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} postId={postId!} />
          ))}
          {topLevelComments.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No comments yet. Be the first to comment!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
