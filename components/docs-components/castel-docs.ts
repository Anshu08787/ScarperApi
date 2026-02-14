export const CASTEL_ENDPOINTS = [
  {
    name: "Castel Stream Extractor",
    method: "GET",
    endpoint: "/api/castel",
    provider: "Castel",
    description: "Extract streaming links using TMDB ID for movies and TV shows via Castle API with AES-CBC decryption",
    requiresAuth: true,
    parameters: [
      { name: "tmdb", type: "string", required: true, description: "TMDB ID of the movie or TV show" },
      { name: "type", type: "string", required: true, description: "Media type: 'movie' or 'tv'" },
      { name: "season", type: "string", required: false, description: "Season number (required for TV shows)" },
      { name: "episode", type: "string", required: false, description: "Episode number (required for TV shows)" },
    ],
    tsExample: `// For Movies
const response = await fetch(\`\${baseUrl}/api/castel?tmdb=550&type=movie\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// For TV Shows
const tvResponse = await fetch(\`\${baseUrl}/api/castel?tmdb=1399&type=tv&season=1&episode=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface CastelStream {
  name: string;
  title: string;
  url: string;
  quality: string;
  size: string;
  headers: {
    'User-Agent': string;
    'Accept': string;
    'Accept-Language': string;
    'Accept-Encoding': string;
    'Connection': string;
    'Sec-Fetch-Dest': string;
    'Sec-Fetch-Mode': string;
    'Sec-Fetch-Site': string;
    'DNT': string;
  };
  provider: string;
}

interface CastelResponse {
  success: boolean;
  data: CastelStream[];
}

const data: CastelResponse = await response.json();
console.log(data);`,
    jsExample: `// For Movies
fetch(\`\${baseUrl}/api/castel?tmdb=550&type=movie\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => {
    console.log('Castel streams:', data.data);
    data.data.forEach(stream => {
      console.log(\`\${stream.name}: \${stream.url} [\${stream.quality}]\`);
    });
  })
  .catch(error => console.error('Error:', error));

// For TV Shows  
fetch(\`\${baseUrl}/api/castel?tmdb=1399&type=tv&season=1&episode=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log('TV episode streams:', data.data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `# For Movies
curl -X GET "https://screenscapeapi.dev/api/castel?tmdb=550&type=movie" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"

# For TV Shows
curl -X GET "https://screenscapeapi.dev/api/castel?tmdb=1399&type=tv&season=1&episode=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": [
    {
      "name": "Castle Hindi - 720p",
      "title": "Fight Club (1999)",
      "url": "https://example.com/stream.m3u8",
      "quality": "720p",
      "size": "1.2 GB",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "video/webm,video/ogg,video/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "DNT": "1"
      },
      "provider": "castle"
    },
    {
      "name": "Castle English - 1080p", 
      "title": "Fight Club (1999)",
      "url": "https://example.com/stream-hd.m3u8",
      "quality": "1080p",
      "size": "2.4 GB",
      "headers": {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "video/webm,video/ogg,video/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
        "Connection": "keep-alive",
        "Sec-Fetch-Dest": "video",
        "Sec-Fetch-Mode": "no-cors", 
        "Sec-Fetch-Site": "cross-site",
        "DNT": "1"
      },
      "provider": "castle"
    }
  ]
}`
  }
];