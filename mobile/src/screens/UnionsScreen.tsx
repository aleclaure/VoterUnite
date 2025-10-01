import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import UnionCard from '../components/UnionCard';
import { useUnions } from '../hooks/useUnions';

export default function UnionsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [scope, setScope] = useState('');
  
  const { unions, loading, refetch } = useUnions({ category, scope, search });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={lightColors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search unions by issue, location, or name..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={lightColors.textMuted}
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterPill, !category && styles.filterPillActive]}
          onPress={() => setCategory('')}
        >
          <Text style={[styles.filterPillText, !category && styles.filterPillTextActive]}>
            All Issues
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, category === 'climate' && styles.filterPillActive]}
          onPress={() => setCategory('climate')}
        >
          <Text style={[styles.filterPillText, category === 'climate' && styles.filterPillTextActive]}>
            Climate
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, category === 'housing' && styles.filterPillActive]}
          onPress={() => setCategory('housing')}
        >
          <Text style={[styles.filterPillText, category === 'housing' && styles.filterPillTextActive]}>
            Housing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, category === 'healthcare' && styles.filterPillActive]}
          onPress={() => setCategory('healthcare')}
        >
          <Text style={[styles.filterPillText, category === 'healthcare' && styles.filterPillTextActive]}>
            Healthcare
          </Text>
        </TouchableOpacity>
      </View>

      {/* Unions List */}
      <FlatList
        data={unions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UnionCard 
            union={item} 
            onPress={() => navigation.navigate('UnionDetail', { unionId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={refetch}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={lightColors.textMuted} />
            <Text style={styles.emptyStateText}>No unions found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your filters or search</Text>
          </View>
        }
      />

      {/* Create Union FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateUnion')}
      >
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: lightColors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: lightColors.border,
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
    padding: 16,
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
  emptyStateSubtext: {
    fontSize: 14,
    color: lightColors.textMuted,
    marginTop: 8,
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
