export const YOUTUBE_ENDPOINTS = [
  {
    name: "YouTube Y2Mate Downloader",
    method: "GET",
    endpoint: "/api/youtubes/y2mate",
    provider: "YouTube (Private)",
    description: "Download YouTube videos and audio using Y2Mate API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",
    requiresAuth: true,
    isPrivate: true,
    requestLimit: 5,
    ownerContact: {
      email: "hunternisha55@gmail.com",
      telegram: "https://t.me/ScreenScapee"
    },
    parameters: [
      { name: "url", type: "string", required: true, description: "YouTube video URL" },
      { name: "format", type: "string", required: false, description: "Output format: 'mp3' or 'mp4' (default: mp3)" },
      { name: "audioBitrate", type: "string", required: false, description: "Audio bitrate: '128', '192', '256', '320' (default: 320)" },
      { name: "videoQuality", type: "string", required: false, description: "Video quality: '360', '480', '720', '1080' (default: 720)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3&audioBitrate=320\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Y2MateResponse {
  success: boolean;
  videoId: string;
  iframeUrl: string;
  downloads?: unknown;
  error?: string;
}

const data: Y2MateResponse = await response.json();
console.log(data);

// ⚠️ WARNING: Limited to 5 requests per API key
// Contact owner to request access or increase limit
// Email: hunternisha55@gmail.com
// Telegram: https://t.me/ScreenScapee`,
    jsExample: `fetch(\`\${baseUrl}/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
  
// ⚠️ LIMITED TO 5 REQUESTS - Contact owner for access`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/youtubes/y2mate?url=https://youtube.com/watch?v=VIDEO_ID&format=mp3&audioBitrate=320" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"
  
# ⚠️ LIMITED TO 5 REQUESTS PER KEY
# Contact: hunternisha55@gmail.com or https://t.me/ScreenScapee`,
    responseExample: `{
  "success": true,
  "videoId": "VIDEO_ID",
  "iframeUrl": "https://frame.y2meta-uk.com/wwwindex.php?videoId=VIDEO_ID",
  "downloads": {
    "title": "Video Title",
    "downloadUrl": "https://...",
    "format": "mp3",
    "quality": "320kbps"
  }
}`
  },
  {
    name: "YouTube VidsSave Downloader",
    method: "GET",
    endpoint: "/api/youtubes/vidssave",
    provider: "YouTube (Private)",
    description: "Download Instagram content via VidsSave. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",
    requiresAuth: true,
    isPrivate: true,
    requestLimit: 5,
    ownerContact: {
      email: "hunternisha55@gmail.com",
      telegram: "https://t.me/ScreenScapee"
    },
    parameters: [
      { name: "link", type: "string", required: true, description: "Instagram post/reel/story URL" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VidsSaveResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

const data: VidsSaveResponse = await response.json();
console.log(data);

// ⚠️ WARNING: Limited to 5 requests per API key
// Contact owner: hunternisha55@gmail.com | https://t.me/ScreenScapee`,
    jsExample: `fetch(\`\${baseUrl}/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/youtubes/vidssave?link=https://instagram.com/p/POST_ID" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "downloadUrl": "https://...",
  "thumbnail": "https://...",
  "title": "Post Title"
}`
  },
  {
    name: "YouTube Main Downloader",
    method: "GET",
    endpoint: "/api/youtubes/youtube",
    provider: "YouTube (Private)",
    description: "Download YouTube videos using primary API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",
    requiresAuth: true,
    isPrivate: true,
    requestLimit: 5,
    ownerContact: {
      email: "hunternisha55@gmail.com",
      telegram: "https://t.me/ScreenScapee"
    },
    parameters: [
      { name: "url", type: "string", required: true, description: "YouTube video URL" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface YouTubeResponse {
  type: string;
  url: string;
  thumbnail: string | null;
  title: string | null;
  duration: number | null;
  videos: {
    format: string;
    quality: string | null;
    url: string;
    sizeMB: number;
  }[];
  audios: {
    format: string;
    quality: string | null;
    url: string;
    sizeMB: number;
  }[];
}

const data: YouTubeResponse = await response.json();
console.log(data);

// ⚠️ Contact: hunternisha55@gmail.com | https://t.me/ScreenScapee`,
    jsExample: `fetch(\`\${baseUrl}/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/youtubes/youtube?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "type": "video",
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "thumbnail": "https://...",
  "title": "Video Title",
  "duration": 180,
  "videos": [
    {
      "format": "mp4",
      "quality": "1080p",
      "url": "https://...",
      "sizeMB": 45.5
    }
  ],
  "audios": [
    {
      "format": "mp3",
      "quality": "320kbps",
      "url": "https://...",
      "sizeMB": 5.2
    }
  ]
}`
  },
  {
    name: "YouTube SSYouTube Downloader",
    method: "GET",
    endpoint: "/api/youtubes/yt2",
    provider: "YouTube (Private)",
    description: "Download YouTube videos using SSYouTube API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",
    requiresAuth: false,
    isPrivate: true,
    requestLimit: 5,
    ownerContact: {
      email: "hunternisha55@gmail.com",
      telegram: "https://t.me/ScreenScapee"
    },
    parameters: [
      { name: "url", type: "string", required: true, description: "YouTube video URL" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface YT2Response {
  success: boolean;
  youtubeUrl: string;
  videoId: string;
  data: unknown;
}

const data: YT2Response = await response.json();
console.log(data);

// ⚠️ LIMITED TO 5 REQUESTS
// Contact: hunternisha55@gmail.com | https://t.me/ScreenScapee`,
    jsExample: `fetch(\`\${baseUrl}/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/youtubes/yt2?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "videoId": "VIDEO_ID",
  "data": {
    "downloadOptions": [...]
  }
}`
  },
  {
    name: "YouTube ClipTo Test",
    method: "GET",
    endpoint: "/api/youtubes/yttest",
    provider: "YouTube (Private)",
    description: "Test YouTube downloader using ClipTo API. ⚠️ LIMITED TO 5 REQUESTS ONLY - Contact owner for access.",
    requiresAuth: false,
    isPrivate: true,
    requestLimit: 5,
    ownerContact: {
      email: "hunternisha55@gmail.com",
      telegram: "https://t.me/ScreenScapee"
    },
    parameters: [
      { name: "url", type: "string", required: false, description: "YouTube video URL (optional, uses default if not provided)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});

interface YTTestResponse {
  success: boolean;
  youtubeUrl: string;
  data: unknown;
}

const data: YTTestResponse = await response.json();
console.log(data);

// ⚠️ FOR TESTING ONLY - LIMITED TO 5 REQUESTS
// Owner Contact:
// Email: hunternisha55@gmail.com
// Telegram: https://t.me/ScreenScapee`,
    jsExample: `fetch(\`\${baseUrl}/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID\`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/youtubes/yttest?url=https://youtube.com/watch?v=VIDEO_ID" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "youtubeUrl": "https://youtube.com/watch?v=VIDEO_ID",
  "data": {
    "data": {
      "success": false,
      "message": "Failed to fetch the video"
    }
  }
}`
  }
];
