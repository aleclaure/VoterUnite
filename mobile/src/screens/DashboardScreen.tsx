import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import StatCard from '../components/StatCard';
import CandidateCard from '../components/CandidateCard';
import { supabase } from '../config/supabase';

export default function DashboardScreen() {
  const [zipCode, setZipCode] = useState('');
  const [stats, setStats] = useState({
    totalMembers: 0,
    pledgedVotes: 0,
    districts: 0,
    commitments: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // In real app, aggregate from Supabase
    setStats({
      totalMembers: 2347892,
      pledgedVotes: 2103445,
      districts: 3847,
      commitments: 12489,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transparency Dashboard</Text>
        <Text style={styles.subtitle}>
          Real-time tracking of collective voting power and candidate commitments
        </Text>
      </View>

      {/* ZIP Search */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter your ZIP code to see local data..."
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
            maxLength={5}
            placeholderTextColor={lightColors.textMuted}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* National Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>National Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            value={stats.totalMembers.toLocaleString()} 
            label="Total Members" 
            icon="people"
            color={lightColors.primary}
            trend="+12.4%"
          />
          <StatCard 
            value={stats.pledgedVotes.toLocaleString()} 
            label="Pledged Votes" 
            icon="checkmark-done"
            color={lightColors.secondary}
            trend="+8.7%"
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard 
            value={stats.districts.toLocaleString()} 
            label="Active Districts" 
            icon="map"
            color={lightColors.accent}
            trend="+15.2%"
          />
          <StatCard 
            value={stats.commitments.toLocaleString()} 
            label="Commitments" 
            icon="handshake"
            color={lightColors.warning}
            trend="+23.1%"
          />
        </View>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>National Union Power Map</Text>
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={48} color={lightColors.textMuted} />
          <Text style={styles.mapPlaceholderText}>Interactive Map</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Click on any state to view local union activity and candidate alignments
          </Text>
        </View>
      </View>

      {/* Candidate Scorecard */}
      <View style={styles.candidatesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Candidate Scorecard</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Select District</Text>
          </TouchableOpacity>
        </View>
        
        <CandidateCard
          name="Jane Doe"
          party="Democrat"
          alignment={85}
          pledges={12847}
          stances={{
            climate: 'support',
            housing: 'support',
            healthcare: 'partial',
          }}
        />
        
        <CandidateCard
          name="John Smith"
          party="Republican"
          alignment={25}
          pledges={1423}
          stances={{
            climate: 'oppose',
            housing: 'oppose',
            healthcare: 'partial',
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.textMuted,
    lineHeight: 24,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: lightColors.text,
  },
  searchButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  mapSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mapPlaceholder: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: lightColors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  candidatesSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: lightColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
