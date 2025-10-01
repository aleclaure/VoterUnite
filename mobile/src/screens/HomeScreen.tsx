import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import StatCard from '../components/StatCard';

export default function HomeScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#3B82F6', '#A855F7']}
        style={styles.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <View style={styles.liveBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveBadgeText}>Join 127,543 organized voters</Text>
          </View>
          
          <Text style={styles.heroTitle}>Your Vote.{'\n'}Your Union.{'\n'}Your Power.</Text>
          
          <Text style={styles.heroSubtitle}>
            Join issue-based voting unions to collectively bargain with candidates, track commitments, and build real political leverage in your district.
          </Text>
          
          <View style={styles.heroButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Unions', { screen: 'CreateUnion' })}
            >
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Create a Union</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Unions')}
            >
              <Ionicons name="search-outline" size={20} color="#3B82F6" />
              <Text style={styles.secondaryButtonText}>Browse Unions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard 
            value="1,247" 
            label="Active Unions" 
            icon="people-outline"
            color={lightColors.primary}
          />
          <StatCard 
            value="2.3M" 
            label="Pledged Votes" 
            icon="checkmark-circle-outline"
            color={lightColors.secondary}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            value="8,432" 
            label="Commitments" 
            icon="handshake-outline"
            color={lightColors.accent}
          />
          <StatCard 
            value="3,847" 
            label="Districts" 
            icon="map-outline"
            color={lightColors.warning}
          />
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How UnionVote Works</Text>
        <Text style={styles.sectionSubtitle}>
          Four simple steps to transform your vote into collective power
        </Text>

        <View style={styles.stepCard}>
          <View style={[styles.stepNumber, { backgroundColor: lightColors.primary + '20' }]}>
            <Text style={[styles.stepNumberText, { color: lightColors.primary }]}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Join or Create a Union</Text>
            <Text style={styles.stepDescription}>
              Choose an issue that matters to you—climate, housing, healthcare—and join others in your district.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={[styles.stepNumber, { backgroundColor: lightColors.secondary + '20' }]}>
            <Text style={[styles.stepNumberText, { color: lightColors.secondary }]}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Vote on Demands</Text>
            <Text style={styles.stepDescription}>
              Democratically decide your union's platform demands through internal voting.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={[styles.stepNumber, { backgroundColor: lightColors.accent + '20' }]}>
            <Text style={[styles.stepNumberText, { color: lightColors.accent }]}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pledge Your Vote</Text>
            <Text style={styles.stepDescription}>
              Commit your vote only to candidates who meet your union's conditions.
            </Text>
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={[styles.stepNumber, { backgroundColor: lightColors.warning + '20' }]}>
            <Text style={[styles.stepNumberText, { color: lightColors.warning }]}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Hold Accountable</Text>
            <Text style={styles.stepDescription}>
              Track candidate commitments and withdraw pledges if promises are broken.
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Ionicons name="stats-chart" size={24} color={lightColors.primary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Transparency Dashboard</Text>
            <Text style={styles.actionDescription}>See live maps and candidate scorecards</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={lightColors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Events')}
        >
          <Ionicons name="calendar" size={24} color={lightColors.secondary} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Events</Text>
            <Text style={styles.actionDescription}>Join organizing activities near you</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={lightColors.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('Education')}
        >
          <Ionicons name="school" size={24} color={lightColors.accent} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Learn & Organize</Text>
            <Text style={styles.actionDescription}>Access education resources and tools</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={lightColors.textMuted} />
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
  hero: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  liveBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    lineHeight: 24,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: lightColors.textMuted,
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: lightColors.textMuted,
    lineHeight: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
});
