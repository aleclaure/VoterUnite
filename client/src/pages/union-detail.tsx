import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Plus, Hash, ArrowUp, ArrowDown, MessageCircle } from "lucide-react";

export default function UnionDetail() {
  const [, params] = useRoute("/unions/:id");
  const unionId = params?.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const { data: union, isLoading } = useQuery({
    queryKey: ["/api/unions", unionId],
    enabled: !!unionId,
  });

  const { data: demands = [] } = useQuery({
    queryKey: ["/api/unions", unionId, "demands"],
    enabled: !!unionId,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["/api/unions", unionId, "channels"],
    enabled: !!unionId,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["/api/channels", selectedChannel, "posts"],
    enabled: !!selectedChannel,
  });

  const { data: membership } = useQuery({
    queryKey: ["/api/unions", unionId, "members", user?.id],
    enabled: !!unionId && !!user?.id,
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      return await apiRequest(`/api/unions/${unionId}/channels`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId, "channels"] });
      setNewChannelName("");
      setIsChannelDialogOpen(false);
      toast({ title: "Success", description: "Channel created!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create channel", variant: "destructive" });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; unionId: string }) => {
      return await apiRequest(`/api/channels/${selectedChannel}/posts`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels", selectedChannel, "posts"] });
      setNewPostTitle("");
      setNewPostContent("");
      setIsPostDialogOpen(false);
      toast({ title: "Success", description: "Post created!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    },
  });

  // Auto-select first channel if none selected (MUST be before early returns!)
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  const handleJoin = async () => {
    try {
      await apiRequest(`/api/unions/${unionId}/join`, {
        method: "POST",
        body: {},
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId] });
      await queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId, "members", user?.id] });
      toast({ title: "Success", description: "You've joined the union!" });
    } catch (error: any) {
      const errorMessage = error.message || "Failed to join union";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!union) {
    return <div className="min-h-screen flex items-center justify-center">Union not found</div>;
  }

  const categoryColors: any = {
    climate: "hsl(158, 64%, 52%)",
    housing: "hsl(221, 83%, 53%)",
    healthcare: "hsl(262, 83%, 58%)",
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: categoryColors[union.category] || "hsl(221, 83%, 53%)" }}
            >
              {union.name[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="union-name">{union.name}</h1>
              <p className="text-muted-foreground">{union.scope} • {union.category}</p>
            </div>
          </div>
          {union.description && (
            <p className="text-muted-foreground mb-6">{union.description}</p>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="discussion" data-testid="tab-discussion">
              <MessageSquare className="w-4 h-4 mr-2" />
              Discussion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl" data-testid="union-members">{union.memberCount?.toLocaleString() || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Members</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl" data-testid="union-pledged">{union.pledgedCount?.toLocaleString() || 0}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Pledged Votes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl" data-testid="union-power">{union.powerIndex || 0}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Union Power</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Union Power Index</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={parseFloat(union.powerIndex || "0")} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  {union.powerIndex || 0}% of voters in this district are unionized
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Top Demands</CardTitle>
              </CardHeader>
              <CardContent>
                {demands.length === 0 ? (
                  <p className="text-muted-foreground">No demands yet</p>
                ) : (
                  <div className="space-y-4">
                    {demands.slice(0, 5).map((demand: any) => (
                      <div key={demand.id}>
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{demand.demandText}</p>
                          <span className="text-sm text-muted-foreground">{demand.supportPercentage}%</span>
                        </div>
                        <Progress value={parseFloat(demand.supportPercentage)} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleJoin} 
              className="w-full" 
              size="lg" 
              data-testid="button-join-union"
              disabled={!!membership}
            >
              {membership ? "Already a Member" : "Join Union"}
            </Button>
          </TabsContent>

          <TabsContent value="discussion" className="mt-0">
            <div className="grid grid-cols-12 gap-6">
              {/* Channel Sidebar */}
              <div className="col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">Channels</CardTitle>
                      {user && (
                        <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid="button-create-channel">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create Channel</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="Channel name"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                data-testid="input-channel-name"
                              />
                              <Button
                                onClick={() => createChannelMutation.mutate({ name: newChannelName })}
                                disabled={!newChannelName || createChannelMutation.isPending}
                                className="w-full"
                                data-testid="button-submit-channel"
                              >
                                Create
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-1">
                        {channels.map((channel: any) => (
                          <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              selectedChannel === channel.id
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            }`}
                            data-testid={`channel-${channel.id}`}
                          >
                            <div className="flex items-center gap-2">
                              <Hash className="h-4 w-4" />
                              {channel.name}
                            </div>
                          </button>
                        ))}
                        {channels.length === 0 && (
                          <p className="text-sm text-muted-foreground px-3">No channels yet</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Posts Feed */}
              <div className="col-span-9">
                {selectedChannel ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        {channels.find((c: any) => c.id === selectedChannel)?.name || "Discussion"}
                      </h2>
                      {user && (
                        <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                          <DialogTrigger asChild>
                            <Button data-testid="button-create-post">
                              <Plus className="h-4 w-4 mr-2" />
                              Create Post
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Create Post</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Input
                                placeholder="Post title"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                data-testid="input-post-title"
                              />
                              <Textarea
                                placeholder="What's on your mind?"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                rows={6}
                                data-testid="input-post-content"
                              />
                              <Button
                                onClick={() => createPostMutation.mutate({ 
                                  title: newPostTitle, 
                                  content: newPostContent,
                                  unionId: unionId!
                                })}
                                disabled={!newPostTitle || !newPostContent || createPostMutation.isPending}
                                className="w-full"
                                data-testid="button-submit-post"
                              >
                                Post
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <Link key={post.id} href={`/posts/${post.id}`}>
                          <Card className="cursor-pointer hover:border-primary transition-colors" data-testid={`post-${post.id}`}>
                            <CardHeader>
                              <CardTitle className="text-xl">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <ArrowUp className="h-4 w-4" />
                                  <span>{(post.upvotes || 0) - (post.downvotes || 0)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  <span>{post.commentCount || 0} comments</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                      {posts.length === 0 && (
                        <Card>
                          <CardContent className="py-8 text-center text-muted-foreground">
                            No posts yet. Be the first to start a discussion!
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      Select a channel to view discussions
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
