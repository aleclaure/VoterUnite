import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import EventCard from '../components/EventCard';
import { supabase } from '../config/supabase';

export default function EventsScreen({ navigation }: any) {
  const [events, setEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      let query = supabase.from('events').select('*').order('date', { ascending: true });
      
      if (filter !== 'all') {
        query = query.eq('eventType', filter);
      }

      const { data } = await query;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Events</Text>
        <Text style={styles.subtitle}>Join local organizing activities</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterPillText, filter === 'all' && styles.filterPillTextActive]}>
            All Events
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, filter === 'canvassing' && styles.filterPillActive]}
          onPress={() => setFilter('canvassing')}
        >
          <Ionicons name="walk" size={16} color={filter === 'canvassing' ? '#fff' : lightColors.text} />
          <Text style={[styles.filterPillText, filter === 'canvassing' && styles.filterPillTextActive]}>
            Canvassing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, filter === 'town_hall' && styles.filterPillActive]}
          onPress={() => setFilter('town_hall')}
        >
          <Ionicons name="people" size={16} color={filter === 'town_hall' ? '#fff' : lightColors.text} />
          <Text style={[styles.filterPillText, filter === 'town_hall' && styles.filterPillTextActive]}>
            Town Halls
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchEvents}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={lightColors.textMuted} />
            <Text style={styles.emptyStateText}>No events found</Text>
          </View>
        }
      />

      {/* Create Event FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: lightColors.textMuted,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightColors.border,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  filterPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.text,
  },
  filterPillTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
