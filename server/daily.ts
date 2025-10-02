interface DailyRoomConfig {
  name: string;
  properties: {
    max_participants: number;
    enable_screenshare?: boolean;
  };
}

interface DailyRoomResponse {
  url: string;
  name: string;
  config: {
    max_participants: number;
    enable_screenshare?: boolean;
  };
}

export interface CreateDailyRoomResult {
  roomUrl: string;
  roomName: string;
  sessionToken: string;
}

export async function createDailyRoom(
  channelId: string,
  channelName: string,
  channelType: 'voice' | 'video'
): Promise<CreateDailyRoomResult> {
  const apiKey = process.env.DAILY_API_KEY;
  
  if (!apiKey) {
    throw new Error("DAILY_API_KEY environment variable is not set");
  }

  const maxParticipants = channelType === 'voice' ? 25 : 10;
  const enableScreenshare = channelType === 'video';

  const roomName = `${channelName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${channelId.slice(0, 8)}-${Date.now()}`;

  const roomConfig: DailyRoomConfig = {
    name: roomName,
    properties: {
      max_participants: maxParticipants,
      ...(enableScreenshare && { enable_screenshare: true })
    }
  };

  try {
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(roomConfig)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Daily.co API error: ${response.status} - ${errorData}`);
    }

    const data: DailyRoomResponse = await response.json();

    const sessionToken = `daily_${channelId}_${Date.now()}`;

    return {
      roomUrl: data.url,
      roomName: data.name,
      sessionToken
    };
  } catch (error) {
    console.error('Failed to create Daily.co room:', error);
    throw error;
  }
}
