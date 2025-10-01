import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../config/supabase';

export default function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [userUnions, setUserUnions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState({
    unionsJoined: 0,
    pledgesMade: 0,
    eventsAttended: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch user unions
      const { data: unions } = await supabase
        .from('union_members')
        .select('*, unions(*)')
        .eq('userId', user.id);
      
      setUserUnions(unions || []);
      setStats(prev => ({ ...prev, unionsJoined: unions?.length || 0 }));

      // Fetch pledges
      const { data: pledges } = await supabase
        .from('pledges')
        .select('*')
        .eq('userId', user.id)
        .eq('status', 'active');
      
      setStats(prev => ({ ...prev, pledgesMade: pledges?.length || 0 }));

      // Fetch badges
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('*')
        .eq('userId', user.id);
      
      setBadges(userBadges || []);

      // Fetch event attendance
      const { data: attendance } = await supabase
        .from('event_attendees')
        .select('*')
        .eq('userId', user.id);
      
      setStats(prev => ({ ...prev, eventsAttended: attendance?.length || 0 }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            navigation.navigate('Auth');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.notAuthContainer}>
        <Ionicons name="person-circle-outline" size={80} color={lightColors.textMuted} />
        <Text style={styles.notAuthText}>Please sign in to view your profile</Text>
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => navigation.navigate('Auth')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getBadgeIcon = (type: string) => {
    const icons: any = {
      first_union: 'person-add',
      pledged: 'checkmark-done',
      organizer: 'people',
      recruiter: 'megaphone',
      educator: 'school',
    };
    return icons[type] || 'ribbon';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.fullName?.split(' ').map(n => n[0]).join('') || user.username[0].toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.name}>{user.fullName || user.username}</Text>
        <Text style={styles.email}>{user.email}</Text>
        {user.district && (
          <Text style={styles.location}>
            <Ionicons name="location" size={14} color={lightColors.textMuted} /> {user.district}
          </Text>
        )}
      </View>

      {/* Stats Grid */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.unionsJoined}</Text>
          <Text style={styles.statLabel}>Unions Joined</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pledgesMade}</Text>
          <Text style={styles.statLabel}>Pledges Made</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.eventsAttended}</Text>
          <Text style={styles.statLabel}>Events Attended</Text>
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges Earned</Text>
        {badges.length > 0 ? (
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badge}>
                <View style={styles.badgeIcon}>
                  <Ionicons 
                    name={getBadgeIcon(badge.badgeType)} 
                    size={24} 
                    color={lightColors.primary} 
                  />
                </View>
                <Text style={styles.badgeLabel}>
                  {badge.badgeType.replace('_', ' ')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No badges earned yet</Text>
        )}
      </View>

      {/* My Unions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Unions</Text>
        {userUnions.length > 0 ? (
          userUnions.map((membership) => (
            <TouchableOpacity 
              key={membership.id} 
              style={styles.unionCard}
              onPress={() => navigation.navigate('Unions', { 
                screen: 'UnionDetail', 
                params: { unionId: membership.unionId } 
              })}
            >
              <View style={styles.unionIcon}>
                <Ionicons name="people" size={24} color={lightColors.primary} />
              </View>
              <View style={styles.unionContent}>
                <Text style={styles.unionName}>{membership.unions.name}</Text>
                <Text style={styles.unionMeta}>
                  Member since {new Date(membership.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={lightColors.textMuted} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>You haven't joined any unions yet</Text>
        )}
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings-outline" size={20} color={lightColors.text} />
          <Text style={styles.actionButtonText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={lightColors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="help-circle-outline" size={20} color={lightColors.text} />
          <Text style={styles.actionButtonText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={lightColors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={20} color={lightColors.error} />
          <Text style={[styles.actionButtonText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  notAuthContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.background,
    padding: 40,
  },
  notAuthText: {
    fontSize: 16,
    color: lightColors.textMuted,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: lightColors.textMuted,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  statsSection: {
    flexDirection: 'row',
    padding: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: lightColors.textMuted,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    alignItems: 'center',
    width: '30%',
  },
  badgeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 11,
    color: lightColors.textMuted,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontSize: 14,
    color: lightColors.textMuted,
    fontStyle: 'italic',
  },
  unionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  unionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: lightColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  unionContent: {
    flex: 1,
  },
  unionName: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 2,
  },
  unionMeta: {
    fontSize: 12,
    color: lightColors.textMuted,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: lightColors.text,
    marginLeft: 12,
  },
  signOutButton: {
    borderColor: lightColors.error + '40',
  },
  signOutText: {
    color: lightColors.error,
  },
});
