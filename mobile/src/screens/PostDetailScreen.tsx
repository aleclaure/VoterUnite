import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

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

const CommentItem = ({ comment, postId, onRefresh, allComments }: { comment: Comment; postId: string; onRefresh: () => void; allComments: Comment[] }) => {
  const { user } = useAuth();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const replies = allComments.filter((c) => c.parentCommentId === comment.id);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to vote');
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/comments/${comment.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ voteType }),
      });
      // Refresh all comments to update vote counts
      onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || !user) return;

    try {
      const session = await supabase.auth.getSession();
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ content: replyText, parentCommentId: comment.id }),
      });
      setReplyText('');
      setShowReplyInput(false);
      onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  const depth = comment.depth || 0;
  const indent = depth * 20;

  return (
    <View style={[styles.commentContainer, { marginLeft: indent }]}>
      <View style={[styles.commentCard, depth > 0 && styles.commentCardNested]}>
        <Text style={styles.commentContent}>{comment.content}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleVote('upvote')}>
            <Ionicons name="arrow-up" size={16} color={lightColors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.voteScore}>{(comment.upvotes || 0) - (comment.downvotes || 0)}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleVote('downvote')}>
            <Ionicons name="arrow-down" size={16} color={lightColors.textMuted} />
          </TouchableOpacity>
          {user && (
            <TouchableOpacity
              style={styles.replyButton}
              onPress={() => setShowReplyInput(!showReplyInput)}
            >
              <Ionicons name="return-down-forward" size={16} color={lightColors.primary} />
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
        {showReplyInput && (
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyInput}
              placeholder="Write a reply..."
              value={replyText}
              onChangeText={setReplyText}
              multiline
            />
            <View style={styles.replyInputButtons}>
              <TouchableOpacity onPress={() => setShowReplyInput(false)}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitReplyButton}
                onPress={handlePostReply}
              >
                <Text style={styles.submitReplyButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      {replies.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} onRefresh={onRefresh} allComments={allComments} />
      ))}
    </View>
  );
};

export default function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const [channelTags, setChannelTags] = useState<any[]>([]);

  useEffect(() => {
    fetchPost();
    fetchComments();
    fetchChannelTags();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}`);
      const data = await response.json();
      setPost(data);
      if (data.unionId) {
        fetchChannels(data.unionId);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async (unionId: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/unions/${unionId}/channels`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchChannelTags = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/channel-tags`);
      const data = await response.json();
      setChannelTags(data);
    } catch (error) {
      console.error('Error fetching channel tags:', error);
    }
  };

  const handleToggleTag = async (channelId: string) => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to manage tags');
      return;
    }

    const isTagged = channelTags.some(tag => tag.channelId === channelId);
    
    try {
      const session = await supabase.auth.getSession();
      if (isTagged) {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/channel-tags/${channelId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
        });
      } else {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/channel-tags`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.data.session?.access_token}`,
          },
          body: JSON.stringify({ channelId }),
        });
      }
      fetchChannelTags();
    } catch (error) {
      Alert.alert('Error', 'Failed to update tags');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/comments`);
      const data = await response.json();
      setAllComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const topLevelComments = allComments.filter((c) => !c.parentCommentId);

  const handleVotePost = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to vote');
      return;
    }

    try {
      const session = await supabase.auth.getSession();
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ voteType }),
      });
      fetchPost();
    } catch (error) {
      Alert.alert('Error', 'Failed to vote');
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      const session = await supabase.auth.getSession();
      await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });
      setNewComment('');
      fetchComments();
      fetchPost();
    } catch (error) {
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  if (loading || !post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isAuthor = user && post && user.id === post.authorId;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Post */}
        <View style={styles.postCard}>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          
          {/* Channel Tags Display */}
          {channelTags.length > 0 && (
            <View style={styles.channelTagsContainer}>
              <Text style={styles.channelTagsLabel}>Posted in:</Text>
              <View style={styles.channelTagsList}>
                {channelTags.map((tag) => {
                  const getChannelIcon = () => {
                    switch (tag.channelType) {
                      case 'voice': return 'mic';
                      case 'video': return 'videocam';
                      default: return 'chatbox';
                    }
                  };
                  
                  return (
                    <View key={tag.channelId} style={styles.channelTagBadge}>
                      <Ionicons name={getChannelIcon()} size={14} color={lightColors.primary} />
                      <Text style={styles.channelTagText}>{tag.channelName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVotePost('upvote')}>
              <Ionicons name="arrow-up" size={20} color={lightColors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.postScore}>{(post.upvotes || 0) - (post.downvotes || 0)}</Text>
            <TouchableOpacity style={styles.voteButton} onPress={() => handleVotePost('downvote')}>
              <Ionicons name="arrow-down" size={20} color={lightColors.textMuted} />
            </TouchableOpacity>
            <View style={styles.commentCount}>
              <Ionicons name="chatbubble-outline" size={20} color={lightColors.textMuted} />
              <Text style={styles.commentCountText}>{post.commentCount || 0} comments</Text>
            </View>
          </View>
        </View>

        {/* Channel Tag Management (Authors Only) */}
        {isAuthor && channels.length > 0 && (
          <View style={styles.tagManagementCard}>
            <Text style={styles.tagManagementTitle}>Channel Tags</Text>
            <Text style={styles.tagManagementDescription}>
              Tag this post to make it appear in multiple channels
            </Text>
            <View style={styles.channelsList}>
              {channels.map((channel) => {
                const isTagged = channelTags.some(tag => tag.channelId === channel.id);
                const getChannelIcon = () => {
                  switch (channel.channelType) {
                    case 'voice': return 'mic';
                    case 'video': return 'videocam';
                    default: return 'chatbox';
                  }
                };
                
                return (
                  <TouchableOpacity
                    key={channel.id}
                    style={[styles.channelItem, isTagged && styles.channelItemTagged]}
                    onPress={() => handleToggleTag(channel.id)}
                  >
                    <View style={styles.channelItemContent}>
                      <Ionicons 
                        name={getChannelIcon()} 
                        size={18} 
                        color={isTagged ? lightColors.primary : lightColors.textMuted} 
                      />
                      <Text style={[styles.channelItemText, isTagged && styles.channelItemTextTagged]}>
                        {channel.name}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isTagged ? 'checkmark-circle' : 'ellipse-outline'} 
                      size={20} 
                      color={isTagged ? lightColors.primary : lightColors.border} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Comment Input */}
        {user && (
          <View style={styles.commentInputCard}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={styles.submitCommentButton}
              onPress={handlePostComment}
              disabled={!newComment.trim()}
            >
              <Text style={styles.submitCommentButtonText}>Post Comment</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({topLevelComments.length})</Text>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onRefresh={fetchComments}
              allComments={allComments}
            />
          ))}
          {topLevelComments.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No comments yet. Be the first to comment!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    color: lightColors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  channelTagsContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  channelTagsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.textMuted,
    marginBottom: 8,
  },
  channelTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  channelTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: lightColors.primary + '15',
    borderRadius: 12,
  },
  channelTagText: {
    fontSize: 13,
    color: lightColors.primary,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voteButton: {
    padding: 4,
  },
  postScore: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 'auto',
  },
  commentCountText: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  commentInputCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitCommentButton: {
    backgroundColor: lightColors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitCommentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    padding: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 16,
  },
  commentContainer: {
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  commentCardNested: {
    borderLeftWidth: 3,
    borderLeftColor: lightColors.primary,
  },
  commentContent: {
    fontSize: 14,
    color: lightColors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  voteScore: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
    padding: 4,
  },
  replyButtonText: {
    fontSize: 14,
    color: lightColors.primary,
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  replyInputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    color: lightColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  submitReplyButton: {
    backgroundColor: lightColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  submitReplyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: lightColors.textMuted,
    textAlign: 'center',
  },
  tagManagementCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  tagManagementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
  },
  tagManagementDescription: {
    fontSize: 14,
    color: lightColors.textMuted,
    marginBottom: 16,
  },
  channelsList: {
    gap: 8,
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: lightColors.border,
    backgroundColor: lightColors.background,
  },
  channelItemTagged: {
    backgroundColor: lightColors.primary + '10',
    borderColor: lightColors.primary,
  },
  channelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelItemText: {
    fontSize: 16,
    color: lightColors.text,
    fontWeight: '500',
  },
  channelItemTextTagged: {
    color: lightColors.primary,
    fontWeight: '600',
  },
});
