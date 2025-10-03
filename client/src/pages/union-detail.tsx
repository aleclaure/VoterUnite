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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Plus, Hash, ArrowUp, ArrowDown, MessageCircle, Mic, Video, Menu, X, Users } from "lucide-react";
import VoiceRoom from "@/components/VoiceRoom";
import VideoRoom from "@/components/VideoRoom";
import type { ChannelSession } from "@shared/schema";

export default function UnionDetail() {
  const [, params] = useRoute("/unions/:id");
  const unionId = params?.id;
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<string>("text");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [showChannelList, setShowChannelList] = useState(false);
  const [activeRoom, setActiveRoom] = useState<{ type: 'voice' | 'video', roomUrl: string, sessionId: string } | null>(null);
  const [joiningChannelId, setJoiningChannelId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'trending' | 'top' | 'new'>('trending');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all');

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
    queryKey: selectedChannel === 'all' 
      ? ["/api/unions", unionId, "posts", sortBy, timeRange, 'all']
      : ["/api/channels", selectedChannel, "posts"],
    enabled: !!selectedChannel,
    queryFn: selectedChannel === 'all'
      ? async () => {
          const params = new URLSearchParams({
            sortBy,
            timeRange,
            channelId: 'all',
            limit: '50',
            offset: '0'
          });
          const response = await fetch(`/api/unions/${unionId}/posts?${params}`, {
            credentials: 'include'
          });
          if (!response.ok) throw new Error('Failed to fetch posts');
          return response.json();
        }
      : undefined,
  });

  const { data: membership } = useQuery({
    queryKey: ["/api/unions", unionId, "members", user?.id],
    enabled: !!unionId && !!user?.id,
  });

  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; channelType?: string; description?: string }) => {
      return await apiRequest(`/api/unions/${unionId}/channels`, {
        method: "POST",
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId, "channels"] });
      setNewChannelName("");
      setNewChannelType("text");
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
      queryClient.invalidateQueries({ queryKey: ["/api/unions", unionId, "posts"] });
      setNewPostTitle("");
      setNewPostContent("");
      setIsPostDialogOpen(false);
      toast({ title: "Success", description: "Post created!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async ({ channelId, channelType }: { channelId: string; channelType: 'voice' | 'video' }) => {
      const data = await apiRequest(`/api/channels/${channelId}/session`, {
        method: "POST",
        body: {},
      });
      return { ...data, channelType, channelId };
    },
    onSuccess: (data: any) => {
      if (!data.session?.roomUrl) {
        setJoiningChannelId(null);
        toast({ title: "Error", description: "Failed to get room URL", variant: "destructive" });
        return;
      }
      
      setActiveRoom({
        type: data.channelType,
        roomUrl: data.session.roomUrl,
        sessionId: data.session.id,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/channels", data.channelId, "session"] });
      setJoiningChannelId(null);
      toast({ title: "Success", description: "Joined room!" });
    },
    onError: () => {
      setJoiningChannelId(null);
      toast({ title: "Error", description: "Failed to join room", variant: "destructive" });
    },
  });

  const handleLeave = async () => {
    if (!activeRoom) return;

    try {
      await apiRequest(`/api/sessions/${activeRoom.sessionId}/leave`, {
        method: "DELETE",
        body: {},
      });
      
      channels.forEach((channel: any) => {
        if (channel.channelType !== 'text') {
          queryClient.invalidateQueries({ queryKey: ["/api/channels", channel.id, "session"] });
        }
      });
      
      setActiveRoom(null);
      toast({ title: "Success", description: "Left room" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to leave room", variant: "destructive" });
    }
  };

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

  function PostChannelTags({ postId }: { postId: string }) {
    const { data: postChannels = [] } = useQuery({
      queryKey: ["/api/posts", postId, "channels"],
      enabled: selectedChannel === 'all' && !!postId,
    });

    if (!postChannels.length || selectedChannel !== 'all') return null;

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {postChannels.map((channel: any) => (
          <Badge 
            key={channel.id} 
            variant="outline" 
            className="text-xs"
            data-testid={`post-channel-badge-${channel.id}`}
          >
            {channel.channelType === 'voice' ? <Mic className="h-3 w-3 mr-1" /> : 
             channel.channelType === 'video' ? <Video className="h-3 w-3 mr-1" /> : 
             <Hash className="h-3 w-3 mr-1" />}
            {channel.name}
          </Badge>
        ))}
      </div>
    );
  }

  function ChannelItem({ channel }: { channel: any }) {
    const { data: session } = useQuery<ChannelSession & { participantCount?: number }>({
      queryKey: ["/api/channels", channel.id, "session"],
      enabled: channel.channelType !== 'text',
      refetchInterval: channel.channelType !== 'text' ? 10000 : false,
    });

    const ChannelIcon = channel.channelType === 'voice' ? Mic : channel.channelType === 'video' ? Video : Hash;
    const isVoiceOrVideo = channel.channelType === 'voice' || channel.channelType === 'video';
    const isJoining = joiningChannelId === channel.id;

    const handleJoinRoom = (e: React.MouseEvent) => {
      e.stopPropagation();
      setJoiningChannelId(channel.id);
      joinRoomMutation.mutate({ 
        channelId: channel.id, 
        channelType: channel.channelType as 'voice' | 'video' 
      });
    };

    return (
      <div
        className={`w-full rounded-md text-sm transition-colors ${
          selectedChannel === channel.id && !isVoiceOrVideo
            ? "bg-primary text-primary-foreground"
            : ""
        }`}
      >
        <button
          onClick={() => {
            if (!isVoiceOrVideo) {
              setSelectedChannel(channel.id);
              setShowChannelList(false);
            }
          }}
          className={`w-full text-left px-3 py-2 rounded-md ${
            !isVoiceOrVideo && selectedChannel === channel.id
              ? ""
              : "hover:bg-muted"
          }`}
          data-testid={`channel-${channel.id}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ChannelIcon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{channel.name}</span>
            </div>
            {isVoiceOrVideo && session && session.isActive && session.participantCount ? (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                <Users className="h-3 w-3 mr-1" />
                {session.participantCount}
              </Badge>
            ) : null}
          </div>
        </button>
        {isVoiceOrVideo && (
          <div className="px-3 pb-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleJoinRoom}
              disabled={isJoining}
              data-testid={`button-join-room-${channel.id}`}
            >
              {isJoining ? (
                "Joining..."
              ) : (
                <>
                  {channel.channelType === 'voice' ? (
                    <Mic className="h-3 w-3 mr-1" />
                  ) : (
                    <Video className="h-3 w-3 mr-1" />
                  )}
                  Join Room
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }

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
            {/* Mobile channel toggle button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChannelList(!showChannelList)}
                className="w-full justify-between"
                data-testid="button-toggle-channels"
              >
                <span className="flex items-center gap-2">
                  {showChannelList ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  {showChannelList ? "Hide Channels" : "Show Channels"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {channels.length} channel{channels.length !== 1 ? 's' : ''}
                </span>
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Channel Sidebar */}
              <div className={`col-span-12 lg:col-span-3 ${showChannelList ? 'block' : 'hidden lg:block'}`}>
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
                              <div className="space-y-2">
                                <Label htmlFor="channel-type">Channel Type</Label>
                                <Select value={newChannelType} onValueChange={setNewChannelType}>
                                  <SelectTrigger id="channel-type" data-testid="select-channel-type">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">
                                      <div className="flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        <span>Text Channel</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="voice">
                                      <div className="flex items-center gap-2">
                                        <Mic className="h-4 w-4" />
                                        <span>Voice Room</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="video">
                                      <div className="flex items-center gap-2">
                                        <Video className="h-4 w-4" />
                                        <span>Video Room</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="channel-name">Channel Name</Label>
                                <Input
                                  id="channel-name"
                                  placeholder="e.g., general, strategy-call"
                                  value={newChannelName}
                                  onChange={(e) => setNewChannelName(e.target.value)}
                                  data-testid="input-channel-name"
                                />
                              </div>
                              <Button
                                onClick={() => createChannelMutation.mutate({ name: newChannelName, channelType: newChannelType })}
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
                        {/* All Posts Virtual Channel */}
                        <div
                          className={`w-full rounded-md text-sm transition-colors ${
                            selectedChannel === 'all'
                              ? "bg-primary text-primary-foreground"
                              : ""
                          }`}
                        >
                          <button
                            onClick={() => {
                              setSelectedChannel('all');
                              setShowChannelList(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-md ${
                              selectedChannel === 'all'
                                ? ""
                                : "hover:bg-muted"
                            }`}
                            data-testid="channel-all"
                          >
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 flex-shrink-0" />
                              <span className="font-semibold">All Posts</span>
                            </div>
                          </button>
                        </div>
                        
                        {/* Regular Channels */}
                        {channels.map((channel: any) => (
                          <ChannelItem key={channel.id} channel={channel} />
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
              <div className="col-span-12 lg:col-span-9">
                {selectedChannel ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold">
                        {selectedChannel === 'all' ? 'All Posts' : channels.find((c: any) => c.id === selectedChannel)?.name || "Discussion"}
                      </h2>
                      {user && selectedChannel !== 'all' && (
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

                    {/* Filter Bar for All Posts */}
                    {selectedChannel === 'all' && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            {/* Sort By Tabs */}
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-sm font-medium text-muted-foreground">Sort:</span>
                              <div className="inline-flex rounded-md border">
                                <button
                                  onClick={() => setSortBy('trending')}
                                  className={`px-3 py-1.5 text-sm transition-colors ${
                                    sortBy === 'trending'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background hover:bg-muted'
                                  }`}
                                  data-testid="filter-trending"
                                >
                                  Trending
                                </button>
                                <button
                                  onClick={() => setSortBy('top')}
                                  className={`px-3 py-1.5 text-sm border-l transition-colors ${
                                    sortBy === 'top'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background hover:bg-muted'
                                  }`}
                                  data-testid="filter-top"
                                >
                                  Top
                                </button>
                                <button
                                  onClick={() => setSortBy('new')}
                                  className={`px-3 py-1.5 text-sm border-l transition-colors ${
                                    sortBy === 'new'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background hover:bg-muted'
                                  }`}
                                  data-testid="filter-new"
                                >
                                  New
                                </button>
                              </div>
                            </div>

                            {/* Time Range Selector (only for trending and top) */}
                            {(sortBy === 'trending' || sortBy === 'top') && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">From:</span>
                                <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                                  <SelectTrigger className="w-[140px]" data-testid="select-time-range">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="space-y-4">
                      {posts.map((post: any) => (
                        <Link key={post.id} href={`/posts/${post.id}`}>
                          <Card className="cursor-pointer hover:border-primary transition-colors" data-testid={`post-${post.id}`}>
                            <CardHeader>
                              <CardTitle className="text-xl">{post.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground mb-4 whitespace-pre-wrap line-clamp-3">{post.content}</p>
                              <div className="flex flex-col gap-2">
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
                                <PostChannelTags postId={post.id} />
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

      {/* Voice/Video Room Dialog */}
      <Dialog open={!!activeRoom} onOpenChange={(open) => !open && handleLeave()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {activeRoom?.type === 'voice' ? 'Voice Room' : 'Video Room'}
            </DialogTitle>
          </DialogHeader>
          {activeRoom && (
            <div className="mt-4">
              {activeRoom.type === 'voice' ? (
                <VoiceRoom roomUrl={activeRoom.roomUrl} onLeave={handleLeave} />
              ) : (
                <VideoRoom roomUrl={activeRoom.roomUrl} onLeave={handleLeave} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
