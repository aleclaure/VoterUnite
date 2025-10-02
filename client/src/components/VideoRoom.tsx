import { useEffect, useState, useRef } from 'react';
import { DailyProvider, useDaily, useParticipantIds, useLocalParticipant, useVideoTrack, useScreenShare } from '@daily-co/daily-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VideoRoomProps {
  roomUrl: string;
  onLeave: () => void;
}

function VideoTile({ participantId, isLocal = false }: { participantId: string; isLocal?: boolean }) {
  const videoState = useVideoTrack(participantId);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoState?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([videoState.persistentTrack]);
    }
  }, [videoState?.persistentTrack]);

  return (
    <Card
      className="relative aspect-video overflow-hidden bg-secondary/50"
      data-testid={`video-tile-${participantId}`}
    >
      {videoState?.isOff ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <VideoOff className="w-12 h-12 text-muted-foreground" />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <span className="text-xs font-medium bg-black/60 px-2 py-1 rounded text-white">
          {participantId.substring(0, 8)}
          {isLocal && ' (You)'}
        </span>
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
        console.log('Requesting camera/mic permissions...');
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log('Permissions granted');
        
        const DailyIframe = (await import('@daily-co/daily-js')).default;
        
        const daily = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: true,
        });

        // Attach event listeners BEFORE joining
        daily.on('joined-meeting', () => {
          console.log('Daily: joined meeting!');
          setConnectionState('connected');
          setError(null);
        });

        daily.on('error', (e: any) => {
          console.error('Daily error:', e);
          setConnectionState('error');
          setError(e?.errorMsg || 'Failed to connect to video room');
        });

        daily.on('left-meeting', () => {
          console.log('Daily: left meeting');
          setConnectionState('connecting');
        });

        setDailyInstance(daily);

        console.log('Joining Daily room:', roomUrl);
        const joinResult = await daily.join({
          url: roomUrl,
          userName: user?.email?.split('@')[0] || 'Guest',
        });
        console.log('Join result:', joinResult);
      } catch (err: any) {
        console.error('Failed to initialize/join:', err);
        console.error('Error details:', { name: err.name, message: err.message, stack: err.stack });
        
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
      if (dailyInstance) {
        dailyInstance.leave().catch(console.error);
        dailyInstance.destroy().catch(console.error);
      }
    };
  }, [roomUrl]);

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
