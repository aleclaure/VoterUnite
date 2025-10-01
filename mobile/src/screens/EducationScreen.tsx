import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';

export default function EducationScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Education Hub</Text>
        <Text style={styles.subtitle}>
          Learn how collective voting works and gain organizing skills
        </Text>
      </View>

      {/* Featured Course */}
      <LinearGradient
        colors={['#3B82F6', '#A855F7']}
        style={styles.featuredCourse}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={16} color="#fff" />
          <Text style={styles.featuredBadgeText}>Featured Course</Text>
        </View>
        
        <Text style={styles.featuredTitle}>Collective Voting 101</Text>
        <Text style={styles.featuredDescription}>
          Master the fundamentals of organizing voters, building coalitions, and negotiating with candidates.
        </Text>
        
        <View style={styles.featuredMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.metaText}>4 hours</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color="#fff" />
            <Text style={styles.metaText}>12,487 enrolled</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="ribbon-outline" size={16} color="#fff" />
            <Text style={styles.metaText}>Certificate</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.featuredButton}>
          <Text style={styles.featuredButtonText}>Start Learning</Text>
          <Ionicons name="arrow-forward" size={20} color={lightColors.primary} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>Course Categories</Text>
        
        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: lightColors.primary + '20' }]}>
            <Ionicons name="book-outline" size={24} color={lightColors.primary} />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Fundamentals</Text>
            <Text style={styles.categoryDescription}>
              Learn the basics of collective voting and organizing
            </Text>
            <Text style={styles.categoryCount}>8 courses →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: lightColors.secondary + '20' }]}>
            <Ionicons name="people-outline" size={24} color={lightColors.secondary} />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Organizing Skills</Text>
            <Text style={styles.categoryDescription}>
              Master community organizing and recruitment
            </Text>
            <Text style={styles.categoryCount}>12 courses →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.categoryCard}>
          <View style={[styles.categoryIcon, { backgroundColor: lightColors.accent + '20' }]}>
            <Ionicons name="scale-outline" size={24} color={lightColors.accent} />
          </View>
          <View style={styles.categoryContent}>
            <Text style={styles.categoryTitle}>Policy & Advocacy</Text>
            <Text style={styles.categoryDescription}>
              Understand policy and legislative processes
            </Text>
            <Text style={styles.categoryCount}>15 courses →</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Upcoming Workshops */}
      <View style={styles.workshopsSection}>
        <Text style={styles.sectionTitle}>Upcoming Live Workshops</Text>
        
        <View style={styles.workshopCard}>
          <View style={styles.workshopDate}>
            <Text style={styles.workshopDay}>15</Text>
            <Text style={styles.workshopMonth}>FEB</Text>
          </View>
          <View style={styles.workshopContent}>
            <View style={styles.workshopHeader}>
              <Text style={styles.workshopTitle}>Building Your First Union</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>
            <View style={styles.workshopMeta}>
              <Ionicons name="time-outline" size={14} color={lightColors.textMuted} />
              <Text style={styles.workshopMetaText}>7:00 PM EST</Text>
              <Text style={styles.workshopMetaDivider}>•</Text>
              <Ionicons name="videocam-outline" size={14} color={lightColors.textMuted} />
              <Text style={styles.workshopMetaText}>Virtual</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>RSVP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.workshopCard}>
          <View style={styles.workshopDate}>
            <Text style={styles.workshopDay}>18</Text>
            <Text style={styles.workshopMonth}>FEB</Text>
          </View>
          <View style={styles.workshopContent}>
            <View style={styles.workshopHeader}>
              <Text style={styles.workshopTitle}>Candidate Negotiations</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
            </View>
            <View style={styles.workshopMeta}>
              <Ionicons name="time-outline" size={14} color={lightColors.textMuted} />
              <Text style={styles.workshopMetaText}>6:30 PM EST</Text>
              <Text style={styles.workshopMetaDivider}>•</Text>
              <Ionicons name="videocam-outline" size={14} color={lightColors.textMuted} />
              <Text style={styles.workshopMetaText}>Virtual</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>RSVP</Text>
          </TouchableOpacity>
        </View>
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
  featuredCourse: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 16,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featuredDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
    marginBottom: 20,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: '#fff',
    fontSize: 14,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  featuredButtonText: {
    color: lightColors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: lightColors.text,
    marginBottom: 16,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: lightColors.textMuted,
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 14,
    color: lightColors.primary,
    fontWeight: '600',
  },
  workshopsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  workshopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: lightColors.border,
    alignItems: 'center',
  },
  workshopDate: {
    width: 48,
    alignItems: 'center',
    marginRight: 16,
  },
  workshopDay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: lightColors.primary,
  },
  workshopMonth: {
    fontSize: 12,
    color: lightColors.textMuted,
  },
  workshopContent: {
    flex: 1,
  },
  workshopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  workshopTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    flex: 1,
  },
  liveBadge: {
    backgroundColor: lightColors.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveBadgeText: {
    color: lightColors.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
  workshopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workshopMetaText: {
    fontSize: 12,
    color: lightColors.textMuted,
  },
  workshopMetaDivider: {
    color: lightColors.textMuted,
  },
  rsvpButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
