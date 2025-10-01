import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import ProgressBar from './ProgressBar';

interface CandidateCardProps {
  name: string;
  party: string;
  alignment: number;
  pledges: number;
  stances: {
    climate?: string;
    housing?: string;
    healthcare?: string;
  };
}

export default function CandidateCard({ 
  name, 
  party, 
  alignment, 
  pledges, 
  stances 
}: CandidateCardProps) {
  const partyColors: any = {
    Democrat: lightColors.primary,
    Republican: '#DC2626',
    Independent: lightColors.accent,
  };

  const getStanceIcon = (stance?: string) => {
    if (stance === 'support') {
      return <Ionicons name="checkmark-circle" size={20} color={lightColors.secondary} />;
    } else if (stance === 'oppose') {
      return <Ionicons name="close-circle" size={20} color={lightColors.error} />;
    } else {
      return <Ionicons name="warning" size={20} color={lightColors.warning} />;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: partyColors[party] + '20' }]}>
          <Text style={[styles.avatarText, { color: partyColors[party] }]}>
            {name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{name}</Text>
          <View style={[styles.partyBadge, { backgroundColor: partyColors[party] + '20' }]}>
            <Text style={[styles.partyText, { color: partyColors[party] }]}>{party}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stancesRow}>
        <View style={styles.stance}>
          <Text style={styles.stanceLabel}>Climate</Text>
          {getStanceIcon(stances.climate)}
        </View>
        <View style={styles.stance}>
          <Text style={styles.stanceLabel}>Housing</Text>
          {getStanceIcon(stances.housing)}
        </View>
        <View style={styles.stance}>
          <Text style={styles.stanceLabel}>Healthcare</Text>
          {getStanceIcon(stances.healthcare)}
        </View>
      </View>

      <View style={styles.alignmentSection}>
        <View style={styles.alignmentHeader}>
          <Text style={styles.alignmentLabel}>Alignment</Text>
          <Text style={styles.alignmentValue}>{alignment}%</Text>
        </View>
        <ProgressBar 
          progress={alignment} 
          color={alignment >= 70 ? lightColors.secondary : alignment >= 40 ? lightColors.warning : lightColors.error}
        />
      </View>

      <View style={styles.footer}>
        <Ionicons name="people" size={16} color={lightColors.textMuted} />
        <Text style={styles.pledgesText}>
          <Text style={styles.pledgesValue}>{pledges.toLocaleString()}</Text> pledged votes
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 4,
  },
  partyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stancesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: lightColors.background,
    borderRadius: 8,
  },
  stance: {
    alignItems: 'center',
    gap: 6,
  },
  stanceLabel: {
    fontSize: 12,
    color: lightColors.textMuted,
  },
  alignmentSection: {
    marginBottom: 12,
  },
  alignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alignmentLabel: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  alignmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: lightColors.text,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pledgesText: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  pledgesValue: {
    fontWeight: 'bold',
    color: lightColors.text,
  },
});
