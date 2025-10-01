import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../config/supabase';

export default function UnionDetailScreen({ route, navigation }: any) {
  const { unionId } = route.params;
  const [union, setUnion] = useState<any>(null);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnionDetails();
  }, [unionId]);

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

  const handleJoinUnion = async () => {
    // In real app, get current user ID from auth
    const userId = 'current-user-id';
    
    try {
      await supabase.from('union_members').insert({
        unionId,
        userId,
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

  return (
    <ScrollView style={styles.container}>
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
});
