import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

type TabType = 'overview' | 'discussion';

export default function UnionDetailScreen({ route, navigation }: any) {
  const { unionId } = route.params;
  const { user } = useAuth();
  const [union, setUnion] = useState<any>(null);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Discussion state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [createChannelVisible, setCreateChannelVisible] = useState(false);
  const [createPostVisible, setCreatePostVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchUnionDetails();
  }, [unionId]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      fetchChannels();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedChannel) {
      fetchPosts();
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels]);

  const fetchUnionDetails = async () => {
    try {
      const { data: unionData } = await supabase
        .from('unions')
        .select('*')
        .eq('id', unionId)
        .single();
      
      const { data: demandsData } = await supabase
        .from('union_demands')
        .select('*')
        .eq('unionId', unionId)
        .order('priority', { ascending: false });

      setUnion(unionData);
      setDemands(demandsData || []);
    } catch (error) {
      console.error('Error fetching union:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/unions/${unionId}/channels`);
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchPosts = async () => {
    if (!selectedChannel) return;
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/channels/${selectedChannel}/posts`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !user) return;
    
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/unions/${unionId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ name: newChannelName }),
      });
      
      if (response.ok) {
        setNewChannelName('');
        setCreateChannelVisible(false);
        fetchChannels();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create channel');
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !user || !selectedChannel) return;
    
    try {
      const session = await supabase.auth.getSession();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/channels/${selectedChannel}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.data.session?.access_token}`,
        },
        body: JSON.stringify({ title: newPostTitle, content: newPostContent }),
      });
      
      if (response.ok) {
        setNewPostTitle('');
        setNewPostContent('');
        setCreatePostVisible(false);
        fetchPosts();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  const handleJoinUnion = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to join this union');
      return;
    }
    
    try {
      await supabase.from('union_members').insert({
        unionId,
        userId: user.id,
        role: 'member'
      });
      
      Alert.alert('Success', 'You have joined the union!');
      fetchUnionDetails();
    } catch (error) {
      Alert.alert('Error', 'Failed to join union');
    }
  };

  if (loading || !union) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const categoryColors: any = {
    climate: lightColors.secondary,
    housing: lightColors.primary,
    healthcare: lightColors.accent,
  };

  const categoryIcons: any = {
    climate: 'leaf',
    housing: 'home',
    healthcare: 'heart',
  };

  const renderOverviewTab = () => (
    <ScrollView>
      {/* Power Index */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Union Power</Text>
          <Text style={styles.powerIndexValue}>{union.powerIndex}%</Text>
        </View>
        <ProgressBar 
          progress={parseFloat(union.powerIndex)} 
          color={categoryColors[union.category]}
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{union.memberCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{union.pledgedCount.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Pledged</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{union.districtCount}</Text>
          <Text style={styles.statLabel}>Districts</Text>
        </View>
      </View>

      {/* Top Demands */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Demands</Text>
        {demands.slice(0, 3).map((demand) => (
          <View key={demand.id} style={styles.demandCard}>
            <Text style={styles.demandText}>{demand.demandText}</Text>
            <View style={styles.demandMeta}>
              <ProgressBar 
                progress={parseFloat(demand.supportPercentage)} 
                color={categoryColors[union.category]}
                height={6}
              />
              <Text style={styles.demandSupport}>{demand.supportPercentage}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Join Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.joinButton, { backgroundColor: categoryColors[union.category] }]}
          onPress={handleJoinUnion}
        >
          <Ionicons name="person-add" size={20} color="#fff" />
          <Text style={styles.joinButtonText}>Join Union</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderDiscussionTab = () => (
    <View style={styles.discussionContainer}>
      {/* Channel Tabs */}
      <View style={styles.channelTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.channelScrollView}>
          {channels.map((channel) => (
            <TouchableOpacity
              key={channel.id}
              style={[
                styles.channelTab,
                selectedChannel === channel.id && styles.channelTabActive,
              ]}
              onPress={() => setSelectedChannel(channel.id)}
            >
              <Text style={[
                styles.channelTabText,
                selectedChannel === channel.id && styles.channelTabTextActive,
              ]}>
                # {channel.name}
              </Text>
            </TouchableOpacity>
          ))}
          {user && (
            <TouchableOpacity
              style={styles.channelTabAdd}
              onPress={() => setCreateChannelVisible(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color={lightColors.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Posts List */}
      <View style={styles.postsContainer}>
        {user && (
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={() => setCreatePostVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color={lightColors.primary} />
            <Text style={styles.createPostText}>Create Post</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.postCard}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>
              <View style={styles.postMeta}>
                <View style={styles.postVotes}>
                  <Ionicons name="arrow-up" size={16} color={lightColors.textMuted} />
                  <Text style={styles.postMetaText}>{(item.upvotes || 0) - (item.downvotes || 0)}</Text>
                </View>
                <View style={styles.postComments}>
                  <Ionicons name="chatbubble-outline" size={16} color={lightColors.textMuted} />
                  <Text style={styles.postMetaText}>{item.commentCount || 0} comments</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts yet. Be the first to start a discussion!</Text>
            </View>
          }
        />
      </View>

      {/* Create Channel Modal */}
      <Modal
        visible={createChannelVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateChannelVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Channel</Text>
            <TextInput
              style={styles.input}
              placeholder="Channel name"
              value={newChannelName}
              onChangeText={setNewChannelName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setCreateChannelVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreateChannel}
              >
                <Text style={styles.modalButtonTextCreate}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={createPostVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreatePostVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TextInput
              style={styles.input}
              placeholder="Post title"
              value={newPostTitle}
              onChangeText={setNewPostTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Post content"
              value={newPostContent}
              onChangeText={setNewPostContent}
              multiline
              numberOfLines={6}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setCreatePostVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreatePost}
              >
                <Text style={styles.modalButtonTextCreate}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: categoryColors[union.category] + '20' }]}>
        <View style={[styles.iconCircle, { backgroundColor: categoryColors[union.category] + '20' }]}>
          <Ionicons name={categoryIcons[union.category]} size={32} color={categoryColors[union.category]} />
        </View>
        
        <Text style={styles.unionName}>{union.name}</Text>
        
        <View style={styles.metaRow}>
          <Ionicons name="location" size={16} color={lightColors.textMuted} />
          <Text style={styles.metaText}>{union.scope}</Text>
          <Text style={styles.metaDivider}>•</Text>
          <Text style={styles.metaText}>{union.category}</Text>
        </View>

        {union.description && (
          <Text style={styles.description}>{union.description}</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussion' && styles.tabActive]}
          onPress={() => setActiveTab('discussion')}
        >
          <Text style={[styles.tabText, activeTab === 'discussion' && styles.tabTextActive]}>
            Discussion
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' ? renderOverviewTab() : renderDiscussionTab()}
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
  header: {
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  unionName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  metaDivider: {
    color: lightColors.textMuted,
  },
  description: {
    fontSize: 16,
    color: lightColors.text,
    lineHeight: 24,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: lightColors.primary,
  },
  tabText: {
    fontSize: 16,
    color: lightColors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: lightColors.primary,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
  },
  powerIndexValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: lightColors.textMuted,
  },
  demandCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  demandText: {
    fontSize: 16,
    color: lightColors.text,
    marginBottom: 12,
  },
  demandMeta: {
    gap: 8,
  },
  demandSupport: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text,
    textAlign: 'right',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  discussionContainer: {
    flex: 1,
  },
  channelTabs: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    backgroundColor: '#fff',
  },
  channelScrollView: {
    paddingHorizontal: 12,
  },
  channelTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  channelTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: lightColors.primary,
  },
  channelTabText: {
    fontSize: 16,
    color: lightColors.textMuted,
    fontWeight: '500',
  },
  channelTabTextActive: {
    color: lightColors.primary,
    fontWeight: '600',
  },
  channelTabAdd: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  postsContainer: {
    flex: 1,
    padding: 16,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
    gap: 8,
  },
  createPostText: {
    fontSize: 16,
    color: lightColors.primary,
    fontWeight: '500',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: lightColors.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  postVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postComments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postMetaText: {
    fontSize: 14,
    color: lightColors.textMuted,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: lightColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: lightColors.background,
  },
  modalButtonCreate: {
    backgroundColor: lightColors.primary,
  },
  modalButtonTextCancel: {
    color: lightColors.text,
    fontWeight: '600',
  },
  modalButtonTextCreate: {
    color: '#fff',
    fontWeight: '600',
  },
});
