import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { supabase } from '../config/supabase';
import Daily, { DailyCall, DailyEvent, DailyEventObject, DailyParticipant } from '@daily-co/react-native-daily-js';

interface VoiceRoomScreenProps {
  route: any;
  navigation: any;
}

export default function VoiceRoomScreen({ route, navigation }: VoiceRoomScreenProps) {
  const { channelId, channelName } = route.params;
  const callObjectRef = useRef<DailyCall | null>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<{ [id: string]: DailyParticipant }>({});
  const [participantVolumes, setParticipantVolumes] = useState<{ [id: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    joinVoiceRoom();
    return () => {
      const call = callObjectRef.current;
      if (call) {
        call.off('joined-meeting', handleJoinedMeeting);
        call.off('participant-joined', handleParticipantUpdate);
        call.off('participant-updated', handleParticipantUpdate);
        call.off('participant-left', handleParticipantLeft);
        call.off('error', handleError);
        call.leave();
        call.destroy();
      }
    };
  }, []);

  const joinVoiceRoom = async () => {
    try {
      setConnectionState('connecting');
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/api/channels/${channelId}/session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create/join session');
      }

      const data = await response.json();
      const { session: dailySession } = data;

      if (!dailySession || !dailySession.roomUrl) {
        throw new Error('Invalid session data');
      }

      const daily = Daily.createCallObject({
        audioSource: true,
        videoSource: false,
      });

      // Set ref immediately before registering listeners
      callObjectRef.current = daily;

      daily.on('joined-meeting', handleJoinedMeeting);
      daily.on('participant-joined', handleParticipantUpdate);
      daily.on('participant-updated', handleParticipantUpdate);
      daily.on('participant-left', handleParticipantLeft);
      daily.on('error', handleError);

      await daily.join({ url: dailySession.roomUrl });
    } catch (err: any) {
      console.error('Voice room join error:', err);
      setError(err.message || 'Failed to join voice room');
      setConnectionState('error');
    }
  };

  const handleJoinedMeeting = useCallback((event?: DailyEventObject) => {
    setConnectionState('connected');
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
      
      // Initialize volumes for all participants
      const volumes: { [id: string]: number } = {};
      Object.keys(parts).forEach(id => {
        if (!parts[id].local) {
          volumes[id] = 100;
        }
      });
      setParticipantVolumes(volumes);
    }
  }, []);

  const handleParticipantUpdate = useCallback((event?: DailyEventObject) => {
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
      
      // Add default volume for new participants
      setParticipantVolumes(prev => {
        const updated = { ...prev };
        Object.keys(parts).forEach(id => {
          if (!parts[id].local && !(id in updated)) {
            updated[id] = 100;
          }
        });
        return updated;
      });
    }
  }, []);

  const handleParticipantLeft = useCallback((event?: DailyEventObject) => {
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
      
      // Clean up volume for left participants
      if (event && 'participant' in event) {
        const participantId = event.participant?.session_id;
        if (participantId) {
          setParticipantVolumes(prev => {
            const updated = { ...prev };
            delete updated[participantId];
            return updated;
          });
        }
      }
    }
  }, []);

  const handleError = useCallback((event?: DailyEventObject) => {
    console.error('Daily error:', event);
    setError('Connection error occurred');
    setConnectionState('error');
  }, []);

  const toggleMute = () => {
    const call = callObjectRef.current;
    if (call) {
      call.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (participantId: string, volume: number) => {
    const call = callObjectRef.current;
    if (call) {
      const normalizedVolume = volume / 100;
      try {
        // Set participant volume using Daily.co API
        (call as any).setParticipantVolume?.(participantId, normalizedVolume);
        setParticipantVolumes(prev => ({
          ...prev,
          [participantId]: volume,
        }));
      } catch (err) {
        console.error('Failed to set volume:', err);
      }
    }
  };

  const leaveRoom = async () => {
    const call = callObjectRef.current;
    if (call) {
      await call.leave();
      call.destroy();
    }
    navigation.goBack();
  };

  const getParticipantList = () => {
    return Object.values(participants).filter(p => !p.local);
  };

  if (connectionState === 'connecting' || connectionState === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="button-back">
            <Ionicons name="arrow-back" size={24} color={lightColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{channelName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lightColors.primary} />
          <Text style={styles.loadingText}>Connecting to voice room...</Text>
        </View>
      </View>
    );
  }

  if (connectionState === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} testID="button-back">
            <Ionicons name="arrow-back" size={24} color={lightColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{channelName}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={lightColors.error} />
          <Text style={styles.errorText}>{error || 'Connection failed'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={joinVoiceRoom} testID="button-retry">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={leaveRoom} testID="button-leave">
          <Ionicons name="arrow-back" size={24} color={lightColors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{channelName}</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Connected</Text>
        </View>
      </View>

      <View style={styles.helpBox}>
        <Ionicons name="information-circle" size={20} color={lightColors.primary} />
        <Text style={styles.helpText}>
          If you have trouble connecting, restart the app and rejoin granting microphone permissions
        </Text>
      </View>

      <View style={styles.participantsSection}>
        <Text style={styles.sectionTitle}>
          Participants ({getParticipantList().length})
        </Text>
        <ScrollView style={styles.participantsList} testID="list-participants">
          {getParticipantList().map((participant) => (
            <View key={participant.session_id} style={styles.participantItem} testID={`participant-${participant.session_id}`}>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>
                  {participant.user_name || participant.session_id.substring(0, 8)}
                </Text>
                <View style={styles.participantStatus}>
                  {participant.audio ? (
                    <Ionicons name="mic" size={16} color={lightColors.success} />
                  ) : (
                    <Ionicons name="mic-off" size={16} color={lightColors.textMuted} />
                  )}
                </View>
              </View>
              <View style={styles.volumeControl}>
                <Ionicons name="volume-medium" size={16} color={lightColors.textMuted} />
                <View style={styles.volumeButtons}>
                  <TouchableOpacity
                    onPress={() => handleVolumeChange(participant.session_id, Math.max(0, (participantVolumes[participant.session_id] || 100) - 25))}
                    style={styles.volumeButton}
                    testID={`button-volume-down-${participant.session_id}`}
                  >
                    <Ionicons name="remove" size={16} color={lightColors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.volumeText}>{participantVolumes[participant.session_id] || 100}%</Text>
                  <TouchableOpacity
                    onPress={() => handleVolumeChange(participant.session_id, Math.min(100, (participantVolumes[participant.session_id] || 100) + 25))}
                    style={styles.volumeButton}
                    testID={`button-volume-up-${participant.session_id}`}
                  >
                    <Ionicons name="add" size={16} color={lightColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonMuted]}
          onPress={toggleMute}
          testID="button-mute"
        >
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={24}
            color="white"
          />
          <Text style={styles.controlButtonText}>
            {isMuted ? 'Unmute' : 'Mute'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.leaveButton]}
          onPress={leaveRoom}
          testID="button-leave-call"
        >
          <Ionicons name="call" size={24} color="white" />
          <Text style={styles.controlButtonText}>Leave</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: lightColors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightColors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lightColors.success,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: lightColors.success,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: lightColors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: lightColors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: lightColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  helpBox: {
    flexDirection: 'row',
    backgroundColor: lightColors.primaryLight,
    padding: 12,
    margin: 16,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  helpText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: lightColors.primary,
  },
  participantsSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    marginBottom: 12,
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: lightColors.text,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    gap: 8,
  },
  volumeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: lightColors.primaryLight,
  },
  volumeText: {
    fontSize: 14,
    color: lightColors.text,
    minWidth: 45,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    backgroundColor: 'white',
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightColors.primary,
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonMuted: {
    backgroundColor: lightColors.error,
  },
  leaveButton: {
    backgroundColor: lightColors.error,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
