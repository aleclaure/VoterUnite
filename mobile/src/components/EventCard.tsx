import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onRSVP?: () => void;
}

export default function EventCard({ event, onRSVP }: EventCardProps) {
  const eventTypeColors: any = {
    canvassing: lightColors.secondary,
    town_hall: lightColors.primary,
    phone_bank: lightColors.accent,
    training: lightColors.warning,
  };

  const eventTypeIcons: any = {
    canvassing: 'walk',
    town_hall: 'people',
    phone_bank: 'call',
    training: 'school',
  };

  const color = eventTypeColors[event.eventType] || lightColors.primary;
  const icon = eventTypeIcons[event.eventType] || 'calendar';
  
  const eventDate = new Date(event.date);
  const dateStr = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const timeStr = eventDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.typeBadgeText, { color }]}>
                {event.eventType.replace('_', ' ')}
              </Text>
            </View>
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        </View>
      </View>

      {event.description && (
        <Text style={styles.description} numberOfLines={3}>
          {event.description}
        </Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={16} color={lightColors.textMuted} />
          <Text style={styles.detailText}>
            {event.isVirtual ? 'Virtual Event' : event.location}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color={lightColors.textMuted} />
          <Text style={styles.detailText}>{timeStr}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color={lightColors.textMuted} />
          <Text style={styles.detailText}>
            <Text style={styles.attendeeCount}>{event.attendeeCount}</Text> attending
          </Text>
        </View>
      </View>

      {onRSVP && (
        <TouchableOpacity 
          style={[styles.rsvpButton, { backgroundColor: color }]}
          onPress={onRSVP}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.rsvpButtonText}>RSVP</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 13,
    color: lightColors.textMuted,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: lightColors.text,
  },
  description: {
    fontSize: 14,
    color: lightColors.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: lightColors.textMuted,
  },
  attendeeCount: {
    fontWeight: 'bold',
    color: lightColors.text,
  },
  rsvpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
