import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightColors } from '../config/theme';
import { supabase } from '../config/supabase';
import Daily, { DailyCall, DailyEventObject, DailyParticipant, DailyMediaView } from '@daily-co/react-native-daily-js';

const { width } = Dimensions.get('window');

interface VideoRoomScreenProps {
  route: any;
  navigation: any;
}

export default function VideoRoomScreen({ route, navigation }: VideoRoomScreenProps) {
  const { channelId, channelName } = route.params;
  const callObjectRef = useRef<DailyCall | null>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [participants, setParticipants] = useState<{ [id: string]: DailyParticipant }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    joinVideoRoom();
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

  const joinVideoRoom = async () => {
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
        videoSource: true,
      });

      // Set ref immediately before registering listeners
      callObjectRef.current = daily;

      daily.on('joined-meeting', handleJoinedMeeting);
      daily.on('participant-joined', handleParticipantUpdate);
      daily.on('participant-updated', handleParticipantUpdate);
      daily.on('participant-left', handleParticipantLeft);
      daily.on('error', handleError);

      await daily.join({ url: dailySession.roomUrl });
      
      // Start camera after joining
      await daily.startCamera();
    } catch (err: any) {
      console.error('Video room join error:', err);
      setError(err.message || 'Failed to join video room');
      setConnectionState('error');
    }
  };

  const handleJoinedMeeting = useCallback(async (event?: DailyEventObject) => {
    setConnectionState('connected');
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
    }
  }, []);

  const handleParticipantUpdate = useCallback((event?: DailyEventObject) => {
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
    }
  }, []);

  const handleParticipantLeft = useCallback((event?: DailyEventObject) => {
    const call = callObjectRef.current;
    if (call) {
      const parts = call.participants();
      setParticipants(parts);
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

  const toggleCamera = () => {
    const call = callObjectRef.current;
    if (call) {
      call.setLocalVideo(!isCameraOff);
      setIsCameraOff(!isCameraOff);
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
    return Object.values(participants);
  };

  const renderVideoTile = (participant: DailyParticipant, isLocal: boolean = false) => {
    const sessionId = participant.session_id;
    
    return (
      <View key={sessionId} style={styles.videoTile} testID={`video-tile-${sessionId}`}>
        {participant.video ? (
          <DailyMediaView
            videoTrack={participant.tracks?.video}
            audioTrack={!isLocal ? participant.tracks?.audio : undefined}
            mirror={isLocal}
            zOrder={isLocal ? 1 : 0}
            style={styles.video}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons name="videocam-off" size={48} color={lightColors.textMuted} />
          </View>
        )}
        <View style={styles.participantLabel}>
          <Text style={styles.participantName}>
            {participant.user_name || sessionId.substring(0, 8)}
            {isLocal && ' (You)'}
          </Text>
          {participant.audio ? (
            <Ionicons name="mic" size={14} color="white" />
          ) : (
            <Ionicons name="mic-off" size={14} color="white" />
          )}
        </View>
      </View>
    );
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
          <Text style={styles.loadingText}>Connecting to video room...</Text>
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
          <TouchableOpacity style={styles.retryButton} onPress={joinVideoRoom} testID="button-retry">
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const participantList = getParticipantList();
  const localParticipant = participantList.find(p => p.local);
  const remoteParticipants = participantList.filter(p => !p.local);

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
          If you have trouble connecting, restart the app and rejoin granting camera and microphone permissions
        </Text>
      </View>

      <ScrollView style={styles.videoGrid} contentContainerStyle={styles.videoGridContent} testID="video-grid">
        {remoteParticipants.map(participant => renderVideoTile(participant, false))}
      </ScrollView>

      {localParticipant && (
        <View style={styles.localVideoContainer}>
          {renderVideoTile(localParticipant, true)}
        </View>
      )}

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
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, isCameraOff && styles.controlButtonMuted]}
          onPress={toggleCamera}
          testID="button-camera"
        >
          <Ionicons
            name={isCameraOff ? 'videocam-off' : 'videocam'}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.leaveButton]}
          onPress={leaveRoom}
          testID="button-leave-call"
        >
          <Ionicons name="call" size={24} color="white" />
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
  videoGrid: {
    flex: 1,
  },
  videoGridContent: {
    padding: 8,
  },
  videoTile: {
    width: width - 16,
    height: (width - 16) * 0.75,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: lightColors.surface,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: lightColors.border,
  },
  participantLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 100,
    right: 16,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: lightColors.primary,
  },
  controls: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: lightColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonMuted: {
    backgroundColor: lightColors.error,
  },
  leaveButton: {
    backgroundColor: lightColors.error,
  },
});
