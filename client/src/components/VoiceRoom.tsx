import { useEffect, useState } from 'react';
import { DailyProvider, useDaily, useParticipantIds, useLocalParticipant, useAudioTrack } from '@daily-co/daily-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VoiceRoomProps {
  roomUrl: string;
  onLeave: () => void;
}

function ParticipantItem({ participantId }: { participantId: string }) {
  const audioTrack = useAudioTrack(participantId);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!audioTrack?.isOff && audioTrack?.persistentTrack) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [audioTrack?.isOff, audioTrack?.persistentTrack]);

  return (
    <div
      data-testid={`text-participant-${participantId}`}
      className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
    >
      <span className="text-sm font-medium">{participantId.substring(0, 8)}</span>
      <div className="flex items-center gap-2">
        <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-150"
            style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
          />
        </div>
        {audioTrack?.isOff ? (
          <MicOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Mic className="w-4 h-4 text-green-500" />
        )}
      </div>
    </div>
  );
}

function VoiceRoomContent({ onLeave }: { onLeave: () => void }) {
  const daily = useDaily();
  const { user } = useAuth();
  const participantIds = useParticipantIds();
  const localParticipant = useLocalParticipant();
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!daily) return;

    const handleJoinedMeeting = () => {
      setConnectionState('connected');
      setError(null);
    };

    const handleError = (event: any) => {
      setConnectionState('error');
      setError(event?.errorMsg || 'Failed to connect to voice room');
    };

    const handleLeftMeeting = () => {
      setConnectionState('connecting');
    };

    daily.on('joined-meeting', handleJoinedMeeting);
    daily.on('error', handleError);
    daily.on('left-meeting', handleLeftMeeting);

    return () => {
      daily.off('joined-meeting', handleJoinedMeeting);
      daily.off('error', handleError);
      daily.off('left-meeting', handleLeftMeeting);
    };
  }, [daily]);

  const toggleMute = () => {
    if (daily) {
      daily.setLocalAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleLeave = async () => {
    if (daily) {
      await daily.leave();
    }
    onLeave();
  };

  const getStatusBadgeVariant = () => {
    switch (connectionState) {
      case 'connected':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      default:
        return 'Connecting...';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Voice Room</CardTitle>
          <Badge variant={getStatusBadgeVariant()}>
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {connectionState === 'connecting' && !error && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Connecting to voice room...</p>
          </div>
        )}

        {connectionState === 'connected' && (
          <>
            <div>
              <h3 className="text-sm font-medium mb-2">Participants ({participantIds.length})</h3>
              <ScrollArea className="h-64" data-testid="list-participants">
                <div className="space-y-2">
                  {participantIds.map((id) => (
                    <ParticipantItem key={id} participantId={id} />
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant={isMuted ? 'destructive' : 'default'}
                onClick={toggleMute}
                className="flex-1"
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
                variant="destructive"
                onClick={handleLeave}
                data-testid="button-leave"
              >
                <PhoneOff className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </>
        )}

        {connectionState === 'error' && (
          <div className="text-center py-4">
            <Button
              variant="destructive"
              onClick={handleLeave}
              data-testid="button-leave"
            >
              <PhoneOff className="w-4 h-4" />
              Leave Room
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VoiceRoom({ roomUrl, onLeave }: VoiceRoomProps) {
  const [dailyInstance, setDailyInstance] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeDaily = async () => {
      try {
        console.log('Requesting microphone permission...');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone permission granted');
        
        const DailyIframe = (await import('@daily-co/daily-js')).default;
        
        const daily = DailyIframe.createCallObject({
          audioSource: true,
          videoSource: false,
        });

        setDailyInstance(daily);

        console.log('Joining Daily room:', roomUrl);
        const joinResult = await daily.join({
          url: roomUrl,
          userName: user?.email?.split('@')[0] || 'Guest',
        });
        console.log('Join result:', joinResult);
      } catch (err: any) {
        console.error('Failed to initialize/join room:', err);
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        
        // Create a minimal daily instance to show error state
        const DailyIframe = (await import('@daily-co/daily-js')).default;
        const daily = DailyIframe.createCallObject();
        setDailyInstance(daily);
        // Trigger error event
        setTimeout(() => {
          daily.emit('error', { 
            errorMsg: err.name === 'NotAllowedError' 
              ? 'Microphone permission denied. Please allow microphone access and try again.' 
              : `Failed to join voice room: ${err.message || 'Unknown error'}`
          });
        }, 100);
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Initializing voice room...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DailyProvider callObject={dailyInstance}>
      <VoiceRoomContent onLeave={onLeave} />
    </DailyProvider>
  );
}
