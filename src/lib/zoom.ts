export async function getZoomAccessToken(): Promise<string> {
  // For development, return mock token
  if (process.env.NODE_ENV === 'development') {
    return 'mock_zoom_access_token';
  }
  
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64');
  
  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );
  
  const data = await response.json();
  return data.access_token;
}

export async function createZoomMeeting(params: {
  topic: string;
  start_time: string;
  duration: number;
  password?: string;
}) {
  // For development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return {
      id: Math.random().toString(36).substr(2, 9),
      join_url: `https://zoom.us/j/mock${Math.random().toString(36).substr(2, 9)}`,
      password: params.password || 'mock123',
    };
  }
  
  const token = await getZoomAccessToken();
  
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: params.start_time,
      duration: params.duration,
      timezone: 'Africa/Nairobi',
      password: params.password,
      settings: {
        host_video: true,
        participant_video: false,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        audio: 'both',
      },
    }),
  });
  
  return await response.json();
}