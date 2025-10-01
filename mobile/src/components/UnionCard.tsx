import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { Union } from '../types';
import ProgressBar from './ProgressBar';

interface UnionCardProps {
  union: Union;
  onPress: () => void;
}

export default function UnionCard({ union, onPress }: UnionCardProps) {
  const categoryColors: any = {
    climate: lightColors.secondary,
    housing: lightColors.primary,
    healthcare: lightColors.accent,
    education: lightColors.warning,
    labor: '#F59E0B',
    other: '#6B7280',
  };

  const categoryIcons: any = {
    climate: 'leaf',
    housing: 'home',
    healthcare: 'heart',
    education: 'school',
    labor: 'briefcase',
    other: 'flag',
  };

  const color = categoryColors[union.category] || categoryColors.other;
  const icon = categoryIcons[union.category] || categoryIcons.other;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.topBorder, { backgroundColor: color }]} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name} numberOfLines={2}>{union.name}</Text>
            <View style={styles.meta}>
              <Ionicons name="location" size={14} color={lightColors.textMuted} />
              <Text style={styles.metaText}>{union.scope}</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>{union.category}</Text>
            </View>
          </View>
          <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
        </View>

        <View style={styles.powerSection}>
          <View style={styles.powerHeader}>
            <Text style={styles.powerLabel}>Union Power</Text>
            <Text style={styles.powerValue}>{union.powerIndex}%</Text>
          </View>
          <ProgressBar progress={parseFloat(union.powerIndex)} color={color} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{union.memberCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{union.pledgedCount.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pledged</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{union.districtCount}</Text>
            <Text style={styles.statLabel}>Districts</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
    overflow: 'hidden',
  },
  topBorder: {
    height: 4,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: lightColors.textMuted,
    textTransform: 'capitalize',
  },
  metaDivider: {
    color: lightColors.textMuted,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerSection: {
    marginBottom: 16,
  },
  powerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  powerLabel: {
    fontSize: 13,
    color: lightColors.textMuted,
  },
  powerValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightColors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: lightColors.textMuted,
  },
});
