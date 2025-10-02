import { useEffect, useState } from 'react';
import { DailyProvider, DailyVideo, useDaily, useParticipantIds, useLocalParticipant, useParticipantProperty, useScreenShare } from '@daily-co/daily-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VideoRoomProps {
  roomUrl: string;
  onLeave: () => void;
}

function VideoTile({ participantId, isLocal = false }: { participantId: string; isLocal?: boolean }) {
  const userName = useParticipantProperty(participantId, 'user_name');
  const videoState = useParticipantProperty(participantId, 'tracks.video.state');
  const audioState = useParticipantProperty(participantId, 'tracks.audio.state');

  // Force log to appear (uses alert as fallback if console is filtered)
  useEffect(() => {
    const logData = {
      userName,
      videoState,
      audioState,
      isLocal,
      timestamp: new Date().toISOString()
    };
    console.log(`🎬 [VideoTile ${participantId.substring(0,8)}] State:`, logData);
    // Also try console.warn to ensure it shows
    console.warn(`📺 VideoState for ${participantId.substring(0,8)}:`, videoState);
  }, [participantId, userName, videoState, audioState, isLocal]);

  // Show video for ANY state except 'off' and 'blocked' - be permissive!
  const shouldShowVideo = videoState !== 'off' && videoState !== 'blocked';

  return (
    <Card
      className="relative aspect-video overflow-hidden bg-secondary/50"
      data-testid={`video-tile-${participantId}`}
    >
      {shouldShowVideo ? (
        <DailyVideo
          sessionId={participantId}
          type="video"
          muted={isLocal}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onLoadedData={() => console.log(`✅ [VideoTile ${participantId.substring(0,8)}] Video loaded`)}
          onError={(e) => console.error(`❌ [VideoTile ${participantId.substring(0,8)}] Video error:`, e)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-muted-foreground" />
          <div className="absolute bottom-1/2 text-xs text-muted-foreground">
            {videoState === 'off' ? 'Camera Off' : videoState === 'blocked' ? 'Camera Blocked' : `State: ${videoState}`}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-xs font-medium bg-black/60 px-2 py-1 rounded text-white">
          {userName || participantId.substring(0, 8)}
          {isLocal && ' (You)'}
        </span>
        {audioState !== 'off' ? (
          <Mic className="w-3 h-3 text-white" />
        ) : (
          <MicOff className="w-3 h-3 text-white" />
        )}
      </div>
    </Card>
  );
}

interface VideoRoomContentProps {
  onLeave: () => void;
  connectionState: 'connecting' | 'connected' | 'error';
  error: string | null;
}

function VideoRoomContent({ onLeave, connectionState, error }: VideoRoomContentProps) {
  const daily = useDaily();
  const { user } = useAuth();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const { screens, startScreenShare, stopScreenShare } = useScreenShare();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    console.log('[VideoRoom] Participants changed:', {
      count: participantIds.length,
      ids: participantIds,
      localId: localParticipant?.session_id
    });
  }, [participantIds, localParticipant]);

  const toggleCamera = () => {
    if (daily) {
      daily.setLocalVideo(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMute = () => {
    if (daily) {
      daily.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      setIsScreenSharing(false);
    } else {
      try {
        await startScreenShare();
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Failed to start screen share:', err);
      }
    }
  };

  const handleLeave = async () => {
    if (daily) {
      await daily.leave();
    }
    onLeave();
  };

  const displayedParticipants = participantIds.slice(0, 10);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <Card className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 If you are having trouble connecting to the call, refresh the webpage or restart the app and rejoin the call granting voice and/or video permissions again
        </p>
      </Card>

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}

      {connectionState === 'connecting' && !error && (
        <Card className="p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Connecting to video room...</p>
          </div>
        </Card>
      )}

      {connectionState === 'connected' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedParticipants.map((id) => (
              <VideoTile
                key={id}
                participantId={id}
                isLocal={id === localParticipant?.session_id}
              />
            ))}
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant={isCameraOn ? 'default' : 'destructive'}
                onClick={toggleCamera}
                data-testid="button-camera"
              >
                {isCameraOn ? (
                  <>
                    <Video className="w-4 h-4" />
                    Camera On
                  </>
                ) : (
                  <>
                    <VideoOff className="w-4 h-4" />
                    Camera Off
                  </>
                )}
              </Button>
              <Button
                variant={isMuted ? 'destructive' : 'default'}
                onClick={toggleMute}
                data-testid="button-mute"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Mute
                  </>
                )}
              </Button>
              <Button
                variant={isScreenSharing ? 'secondary' : 'outline'}
                onClick={toggleScreenShare}
                data-testid="button-screenshare"
              >
                <MonitorUp className="w-4 h-4" />
                {isScreenSharing ? 'Stop Share' : 'Share Screen'}
              </Button>
              <Button
                variant="destructive"
                onClick={handleLeave}
                data-testid="button-leave"
              >
                <PhoneOff className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </Card>
        </>
      )}

      {connectionState === 'error' && (
        <Card className="p-8">
          <div className="text-center">
            <Button
              variant="destructive"
              onClick={handleLeave}
              data-testid="button-leave"
            >
              <PhoneOff className="w-4 h-4" />
              Leave Room
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function VideoRoom({ roomUrl, onLeave }: VideoRoomProps) {
  const [dailyInstance, setDailyInstance] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeDaily = async () => {
      try {
        console.log('🎥 [VideoRoom] Requesting camera/mic permissions...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('✅ [VideoRoom] Permissions granted, tracks:', {
          audioTracks: stream.getAudioTracks().length,
          videoTracks: stream.getVideoTracks().length,
        });
        
        const DailyIframe = (await import('@daily-co/daily-js')).default;
        console.log('📦 [VideoRoom] Daily.co library loaded');
        
        const daily = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: true,
        });
        console.log('🔧 [VideoRoom] Daily call object created');

        // Attach event listeners BEFORE joining
        daily.on('joined-meeting', async (event: any) => {
          console.log('🎉 [VideoRoom] Joined meeting!', event);
          
          // Log participant info
          const participants = daily.participants();
          console.log('👥 [VideoRoom] Current participants:', Object.keys(participants).length);
          Object.entries(participants).forEach(([id, p]: [string, any]) => {
            console.log(`  - ${id}:`, {
              local: p.local,
              userName: p.user_name,
              video: p.tracks?.video?.state,
              audio: p.tracks?.audio?.state
            });
          });
          
          // Ensure camera is started after joining
          try {
            console.log('📹 [VideoRoom] Starting camera...');
            const cameraResult = await daily.startCamera();
            console.log('✅ [VideoRoom] Camera started:', cameraResult);
          } catch (err) {
            console.error('❌ [VideoRoom] Failed to start camera:', err);
          }
          setConnectionState('connected');
          setError(null);
        });

        daily.on('participant-joined', (event: any) => {
          console.log('👤 [VideoRoom] Participant joined:', event?.participant?.user_id || event?.participant?.session_id);
        });

        daily.on('participant-updated', (event: any) => {
          console.log('🔄 [VideoRoom] Participant updated:', {
            id: event?.participant?.session_id,
            video: event?.participant?.tracks?.video?.state,
            audio: event?.participant?.tracks?.audio?.state
          });
        });

        daily.on('error', (e: any) => {
          console.error('❌ [VideoRoom] Daily error:', e);
          setConnectionState('error');
          setError(e?.errorMsg || 'Failed to connect to video room');
        });

        daily.on('left-meeting', () => {
          console.log('👋 [VideoRoom] Left meeting');
          setConnectionState('connecting');
        });

        daily.on('camera-error', (e: any) => {
          console.error('📹❌ [VideoRoom] Camera error:', e);
        });

        daily.on('started-camera', () => {
          console.log('📹✅ [VideoRoom] Camera started event');
        });

        setDailyInstance(daily);

        console.log('🚀 [VideoRoom] Joining Daily room:', roomUrl);
        const joinResult = await daily.join({
          url: roomUrl,
          userName: user?.email?.split('@')[0] || 'Guest',
        });
        console.log('✅ [VideoRoom] Join result:', joinResult);
      } catch (err: any) {
        console.error('❌ [VideoRoom] Failed to initialize/join:', err);
        console.error('📋 [VideoRoom] Error details:', { name: err.name, message: err.message, stack: err.stack });
        
        setConnectionState('error');
        setError(
          err.name === 'NotAllowedError' 
            ? 'Camera/microphone permission denied. Please allow access and try again.' 
            : `Failed to join video room: ${err.message || 'Unknown error'}`
        );
      }
    };

    initializeDaily();

    return () => {
      // Cleanup uses the daily instance directly, not state
      if (dailyInstance) {
        console.log('🧹 [VideoRoom] Cleaning up Daily instance');
        dailyInstance.leave().catch((err: any) => console.error('Error leaving:', err));
        dailyInstance.destroy().catch((err: any) => console.error('Error destroying:', err));
      }
    };
  }, [roomUrl, dailyInstance]);

  if (!dailyInstance) {
    return (
      <Card className="w-full max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Initializing video room...</p>
        </div>
      </Card>
    );
  }

  return (
    <DailyProvider callObject={dailyInstance}>
      <VideoRoomContent 
        onLeave={onLeave}
        connectionState={connectionState}
        error={error}
      />
    </DailyProvider>
  );
}
