"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Copy, Play, Check, Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ANIMESALT_ENDPOINTS } from "../../../components/docs-components/animesalt-docs"
import { ANIMEPAHE_ENDPOINTS } from "../../../components/docs-components/animepahe-docs"
import { CASTEL_ENDPOINTS } from "../../../components/docs-components/castel-docs"
import { KMMOVIES_ENDPOINTS } from "../../../components/docs-components/kmmovies-docs"
import { NETMIRROR_ENDPOINTS } from "../../../components/docs-components/netmirror-docs"
import { XM_ENDPOINTS } from "../../../components/docs-components/xm-docs"
import { XX_ENDPOINTS } from "../../../components/docs-components/xx-docs"
import { XOZ_ENDPOINTS } from "../../../components/docs-components/xoz-docs"
import { XS_ENDPOINTS } from "../../../components/docs-components/xs-docs"
import { XP_ENDPOINTS } from "../../../components/docs-components/xp-docs"
import { SB_ENDPOINTS } from "../../../components/docs-components/sb-docs"
import { EXTRACTORS_ENDPOINTS } from "../../../components/docs-components/extractors-docs"
import { UHDMOVIES_ENDPOINTS } from "../../../components/docs-components/uhdmovies-docs"
import { MOD_ENDPOINTS } from "../../../components/docs-components/mod-docs"
import { ZTEEN_ENDPOINTS } from "../../../components/docs-components/zteen-docs"
import { XV_ENDPOINTS } from "../../../components/docs-components/xv-docs"
import { FZ_ENDPOINTS } from "../../../components/docs-components/fz-docs"

interface ApiEndpoint {
  name: string
  method: string
  endpoint: string
  description: string
  requiresAuth: boolean
  provider: string
  parameters?: { name: string; type: string; required: boolean; description: string }[]
  tsExample: string
  jsExample: string
  curlExample: string
  responseExample: string
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    name: "4kHDHub Home",
    method: "GET",
    endpoint: "/api/4khdhub",
    provider: "4kHDHub",
    description: "Get recent movies and TV shows from 4kHDHub homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/4khdhub?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  year: string;
  season?: string;
  formats: string[];
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/4khdhub?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/4khdhub?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Inception (2010)",
    "url": "/inception-2010",
    "imageUrl": "https://...",
    "year": "2010",
    "formats": ["4K", "BluRay", "WEB-DL"]
  }
]`
  },
  {
    name: "4kHDHub Search",
    method: "GET",
    endpoint: "/api/4khdhub/search",
    provider: "4kHDHub",
    description: "Search movies and TV shows on 4kHDHub",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/4khdhub/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  title: string;
  url: string;
  imageUrl: string;
  year: string;
  season?: string;
  formats: string[];
}

const results: SearchResult[] = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/4khdhub/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/4khdhub/search?q=inception" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Inception (2010)",
    "url": "/inception-2010",
    "imageUrl": "https://...",
    "year": "2010",
    "formats": ["4K", "BluRay", "WEB-DL"]
  }
]`
  },
  {
    name: "4kHDHub Details",
    method: "GET",
    endpoint: "/api/4khdhub/details",
    provider: "4kHDHub",
    description: "Get movie/show details and download links from 4kHDHub",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie/show URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/4khdhub/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieDetails {
  title: string;
  imageUrl: string;
  year: string;
  description: string;
  downloadLinks: Array<{
    quality: string;
    size: string;
    url: string;
  }>;
}

const details: MovieDetails = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/4khdhub/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/4khdhub/details?url=/inception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Inception (2010)",
  "imageUrl": "https://...",
  "year": "2010",
  "description": "A thief who steals corporate secrets...",
  "downloadLinks": [
    {
      "quality": "4K BluRay",
      "size": "8.5GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "4kHDHub Gadget Link Decoder",
    method: "GET",
    endpoint: "/api/4khdhub/gadget",
    provider: "4kHDHub",
    description: "Decode encrypted gadgetsweb.xyz links to get actual download/redirect links",
    requiresAuth: true,
    parameters: [
      { name: "link", type: "string", required: true, description: "Encrypted gadgetsweb.xyz link to decode" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/4khdhub/gadget?link=\${encodeURIComponent(gadgetLink)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface GadgetResponse {
  success: boolean;
  originalLink: string;
  decodedLink: string;
  finalLink: string;
}

const result: GadgetResponse = await response.json();
console.log(result);`,
    jsExample: `fetch(\`\${baseUrl}/api/4khdhub/gadget?link=\${encodeURIComponent(gadgetLink)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/4khdhub/gadget?link=https%3A%2F%2Fgadgetsweb.xyz%2F%3Fid%3D..." \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "originalLink": "https://gadgetsweb.xyz/?id=...",
  "decodedLink": "https://hubcloud.lol/...",
  "finalLink": "https://hubcloud.lol/drive/..."
}`
  },
  {
    name: "DesireMovies Home",
    method: "GET",
    endpoint: "/api/desiremovies",
    provider: "DesireMovies",
    description: "Get recent movies from DesireMovies homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/desiremovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  description: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/desiremovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/desiremovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "12345",
    "title": "Avatar: The Way of Water",
    "url": "/avatar-the-way-of-water-2022",
    "imageUrl": "https://...",
    "description": "Set more than a decade after..."
  }
]`
  },
  {
    name: "DesireMovies Search",
    method: "GET",
    endpoint: "/api/desiremovies/search",
    provider: "DesireMovies",
    description: "Search movies on DesireMovies",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/desiremovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  description: string;
}

const results: { query: string; results: Movie[] } = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/desiremovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/desiremovies/search?q=avatar" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "query": "avatar",
  "results": [
    {
      "id": "avatar-2022",
      "title": "Avatar: The Way of Water",
      "url": "/avatar-the-way-of-water-2022",
      "imageUrl": "https://...",
      "description": "Set more than a decade after..."
    }
  ]
}`
  },
  {
    name: "DesireMovies Details",
    method: "GET",
    endpoint: "/api/desiremovies/details",
    provider: "DesireMovies",
    description: "Get movie details and download links from DesireMovies",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/desiremovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/desiremovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/desiremovies/details?url=/avatar-2022" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Avatar: The Way of Water",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.5GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "Drive Home",
    method: "GET",
    endpoint: "/api/drive",
    provider: "Drive",
    description: "Get recent movies from Drive homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/drive?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/drive?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/drive?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Inception",
    "url": "/movie/inception-2010",
    "imageUrl": "https://...",
    "quality": "1080p"
  }
]`
  },
  {
    name: "Drive Search",
    method: "GET",
    endpoint: "/api/drive/search",
    provider: "Drive",
    description: "Search movies and TV shows on Drive",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/drive/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  category: string[];
  imdbId: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    query: string;
    page: number;
    results: SearchResult[];
    totalResults: number;
    found: number;
  };
}

const data: SearchResponse = await response.json();
console.log(data);`,
    jsExample: `fetch(\`\${baseUrl}/api/drive/search?q=\${query}&page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/drive/search?q=inception&page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": {
    "query": "inception",
    "page": 1,
    "results": [
      {
        "id": "12345",
        "title": "Inception",
        "url": "/movie/inception-2010",
        "imageUrl": "https://...",
        "category": ["Action", "Sci-Fi"],
        "imdbId": "tt1375666"
      }
    ],
    "totalResults": 10,
    "found": 150
  }
}`
  },
  {
    name: "Drive Details",
    method: "GET",
    endpoint: "/api/drive/details",
    provider: "Drive",
    description: "Get detailed information and download links for a movie or TV show",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Full URL of the movie/show page" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/drive/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadLink {
  title: string;
  url: string;
}

interface MovieDetails {
  title: string;
  imdbRating: string;
  language: string;
  year: string;
  episodeSize: string;
  completeZip: string;
  quality: string;
  format: string;
  storyline: string;
  screenshots: string[];
  downloadLinks: {
    "480p": DownloadLink[];
    "720p": DownloadLink[];
    "1080p": DownloadLink[];
    "4K": DownloadLink[];
  };
}

const details: MovieDetails = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/drive/details?url=\${encodeURIComponent(movieUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/drive/details?url=https%3A%2F%2Fdrive.com%2Fmovie%2Finception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Inception (2010)",
  "imdbRating": "8.8/10",
  "language": "English",
  "year": "2010",
  "episodeSize": "300MB",
  "completeZip": "2.5GB",
  "quality": "BluRay",
  "format": "MKV",
  "storyline": "A thief who steals corporate secrets...",
  "screenshots": ["https://...", "https://..."],
  "downloadLinks": {
    "480p": [
      {
        "title": "480p x264",
        "url": "https://..."
      }
    ],
    "720p": [
      {
        "title": "720p x264",
        "url": "https://..."
      }
    ],
    "1080p": [
      {
        "title": "1080p x264",
        "url": "https://..."
      }
    ],
    "4K": []
  }
}`
  },
  {
    name: "Drive MDrive",
    method: "GET",
    endpoint: "/api/drive/mdrive",
    provider: "Drive",
    description: "Extract HubCloud download links for episodes or movies",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Full URL of the page containing HubCloud links" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/drive/mdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Episode {
  episode: string;
  size: string;
  hubCloudUrl: string;
}

interface MDriveResponse {
  success: boolean;
  url: string;
  title: string;
  totalEpisodes: number;
  episodes: Episode[];
}

const data: MDriveResponse = await response.json();
console.log(data);`,
    jsExample: `fetch(\`\${baseUrl}/api/drive/mdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/drive/mdrive?url=https%3A%2F%2Fdrive.com%2Fseries%2Fbreaking-bad" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "url": "https://drive.com/series/breaking-bad",
  "title": "Breaking Bad S01",
  "totalEpisodes": 7,
  "episodes": [
    {
      "episode": "Ep1",
      "size": "150MB",
      "hubCloudUrl": "https://hubcloud.lol/..."
    },
    {
      "episode": "Ep2",
      "size": "155MB",
      "hubCloudUrl": "https://hubcloud.lol/..."
    }
  ]
}`
  },
  {
    name: "NetMirror Home",
    method: "GET",
    endpoint: "/api/netmirror",
    provider: "NetMirror",
    description: "Get recent content from NetMirror homepage",
    requiresAuth: true,
    parameters: [],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NetMirrorItem {
  id: string;
  title: string;
  imageUrl: string;
  postUrl: string;
  category: string;
}

interface Response {
  success: boolean;
  data: {
    items: NetMirrorItem[];
    totalResults: number;
  };
}

const result: Response = await response.json();
console.log(result);`,
    jsExample: `fetch(\`\${baseUrl}/api/netmirror\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/netmirror" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": {
    "items": [
      {
        "id": "12345",
        "title": "Movie Title",
        "imageUrl": "https://...",
        "postUrl": "/post/movie-title",
        "category": "Movies"
      }
    ],
    "totalResults": 50
  }
}`
  },
  {
    name: "Movies4u Home",
    method: "GET",
    endpoint: "/api/movies4u",
    provider: "Movies4u",
    description: "Get recent movies from Movies4u homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/movies4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  videoLabel: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/movies4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/movies4u?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "batman-2022",
    "title": "The Batman",
    "url": "/the-batman-2022",
    "imageUrl": "https://...",
    "videoLabel": "BluRay"
  }
]`
  },
  {
    name: "Movies4u Search",
    method: "GET",
    endpoint: "/api/movies4u/search",
    provider: "Movies4u",
    description: "Search movies on Movies4u",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/movies4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  videoLabel: string;
}

const results: SearchResult[] = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/movies4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/movies4u/search?q=batman" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "batman-2022",
    "title": "The Batman",
    "url": "/the-batman-2022",
    "imageUrl": "https://...",
    "videoLabel": "BluRay"
  }
]`
  },
  {
    name: "Movies4u Details",
    method: "GET",
    endpoint: "/api/movies4u/details",
    provider: "Movies4u",
    description: "Get movie details and download links from Movies4u",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/movies4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/movies4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/movies4u/details?url=/batman-2022" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "The Batman (2022)",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "3GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "Movies4u M4U Links",
    method: "GET",
    endpoint: "/api/movies4u/m4ulinks",
    provider: "Movies4u",
    description: "Extract episode download links from Movies4u pages with Hub-Cloud and Direct-Drive-link options",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Full URL of the Movies4u page containing episode links" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/movies4u/m4ulinks?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface DownloadOption {
  label: string;
  url: string;
  type: string; // Hub-Cloud, Direct-Drive-link, G-Drive, etc.
}

interface QualityDownload {
  quality: string; // Episode 1, Episode 2, etc.
  size: string;
  options: DownloadOption[];
}

interface M4ULinksData {
  title: string;
  note: string;
  downloads: QualityDownload[];
}

interface M4UResponse {
  success: boolean;
  data: M4ULinksData;
  hubcloudLinks: string[];
  totalEpisodes: number;
}

const result: M4UResponse = await response.json();
console.log(result);`,
    jsExample: `fetch(\`\${baseUrl}/api/movies4u/m4ulinks?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(result => console.log(result))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/movies4u/m4ulinks?url=https%3A%2F%2Fmovies4u.foo%2Fseries-episode-page" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": {
    "title": "Always Use Official Website Movies4u.Foo",
    "note": "NOTE: In V-Cloud [Resumable] Download Option Show Download Limit Error then use {Download From Telegram 🔥} Option For Download in V-Cloud",
    "downloads": [
      {
        "quality": "Episode 1",
        "size": "N/A",
        "options": [
          {
            "label": "🚀 Hub-Cloud [DD]",
            "url": "https://hubcloud.foo/video/omxbqublmm6kfjy",
            "type": "Hub-Cloud"
          },
          {
            "label": "🚀 Direct-[Drive-link]",
            "url": "https://filebee.xyz/file/6669aabebdec4829239352b7",
            "type": "Direct-Drive-link"
          }
        ]
      },
      {
        "quality": "Episode 2",
        "size": "N/A",
        "options": [
          {
            "label": "🚀 Hub-Cloud [DD]",
            "url": "https://hubcloud.foo/video/mpsml6h8cfll6c8",
            "type": "Hub-Cloud"
          },
          {
            "label": "🚀 Direct-[Drive-link]",
            "url": "https://filebee.xyz/file/6669aabfbdec4829239352f4",
            "type": "Direct-Drive-link"
          }
        ]
      }
    ]
  },
  "hubcloudLinks": [
    "https://hubcloud.foo/video/omxbqublmm6kfjy",
    "https://hubcloud.foo/video/mpsml6h8cfll6c8"
  ],
  "totalEpisodes": 8
}`
  },
  {
    name: "HDHub4U Home",
    method: "GET",
    endpoint: "/api/hdhub4u",
    provider: "HDHub4U",
    description: "Get recent movies from HDHub4U homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/hdhub4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/hdhub4u?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/hdhub4u?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "avengers-2019",
    "title": "Avengers: Endgame",
    "url": "/movie/avengers-endgame-2019",
    "imageUrl": "https://..."
  }
]`
  },
  {
    name: "HDHub4U Search",
    method: "GET",
    endpoint: "/api/hdhub4u/search",
    provider: "HDHub4U",
    description: "Search movies on HDHub4U",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/hdhub4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieResult {
  title: string;
  url: string;
  imageUrl: string;
  year?: string;
  quality?: string;
}

const results: MovieResult[] = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/hdhub4u/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/hdhub4u/search?q=avengers" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Avengers: Endgame",
    "url": "/movie/avengers-endgame-2019",
    "imageUrl": "https://...",
    "year": "2019",
    "quality": "BluRay"
  }
]`
  },
  {
    name: "HDHub4U Details",
    method: "GET",
    endpoint: "/api/hdhub4u/details",
    provider: "HDHub4U",
    description: "Get movie details and download links",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/hdhub4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface MovieDetails {
  title: string;
  imageUrl: string;
  description: string;
  downloadLinks: Array<{
    quality: string;
    size: string;
    url: string;
  }>;
}

const details: MovieDetails = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/hdhub4u/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/hdhub4u/details?url=/movie/inception-2010" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Inception (2010)",
  "imageUrl": "https://...",
  "description": "A thief who steals corporate secrets...",
  "downloadLinks": [
    {
      "quality": "1080p BluRay",
      "size": "2.4GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "Zeefliz Home",
    method: "GET",
    endpoint: "/api/zeefliz",
    provider: "Zeefliz",
    description: "Get recent movies and shows from Zeefliz homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zeefliz?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/zeefliz?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zeefliz?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "stranger-things",
    "title": "Stranger Things",
    "url": "/stranger-things-complete-series",
    "imageUrl": "https://...",
    "quality": "1080p"
  }
]`
  },
  {
    name: "Zeefliz Search",
    method: "GET",
    endpoint: "/api/zeefliz/search",
    provider: "Zeefliz",
    description: "Search movies and shows on Zeefliz",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zeefliz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface SearchResult {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
}

const results: SearchResult[] = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/zeefliz/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zeefliz/search?q=stranger" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "id": "stranger-things",
    "title": "Stranger Things",
    "url": "/stranger-things-complete-series",
    "imageUrl": "https://..."
  }
]`
  },
  {
    name: "Zeefliz Details",
    method: "GET",
    endpoint: "/api/zeefliz/details",
    provider: "Zeefliz",
    description: "Get movie/show details and download links from Zeefliz",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Content URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zeefliz/details?url=\${contentUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/zeefliz/details?url=\${contentUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zeefliz/details?url=/movie-2024" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Movie Title (2024)",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "Vega Movies Home",
    method: "GET",
    endpoint: "/api/vega",
    provider: "Vega Movies",
    description: "Get recent movies from Vega Movies homepage",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/vega?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  title: string;
  url: string;
  imageUrl: string;
  date: string;
}

const movies: Movie[] = await response.json();
console.log(movies);`,
    jsExample: `fetch(\`\${baseUrl}/api/vega?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(movies => console.log(movies))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/vega?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Spider-Man: No Way Home",
    "url": "/movie/spiderman-no-way-home",
    "imageUrl": "https://...",
    "date": "2021-12-15"
  }
]`
  },
  {
    name: "Vega Movies Search",
    method: "GET",
    endpoint: "/api/vega/search",
    provider: "Vega Movies",
    description: "Search movies on Vega Movies",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/vega/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/vega/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/vega/search?q=spiderman" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Spider-Man: No Way Home",
    "url": "/movie/spiderman-no-way-home",
    "imageUrl": "https://...",
    "year": "2021"
  }
]`
  },
  {
    name: "Vega Movies Details",
    method: "GET",
    endpoint: "/api/vega/details",
    provider: "Vega Movies",
    description: "Get movie details and download links from Vega Movies",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/vega/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/vega/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/vega/details?url=/spiderman-2021" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Spider-Man: No Way Home",
  "imageUrl": "https://...",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.8GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "Vega Movies NextDrive",
    method: "GET",
    endpoint: "/api/vega/nextdrive",
    provider: "Vega Movies",
    description: "Extract V-Cloud download links from Vega Movies pages",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Full URL of the Vega Movies page" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface VCloudLink {
  label: string;
  url: string;
}

interface NextDriveResponse {
  success: boolean;
  title: string;
  vcloudLinks: VCloudLink[];
}

const data: NextDriveResponse = await response.json();
console.log(data);`,
    jsExample: `fetch(\`\${baseUrl}/api/vega/nextdrive?url=\${encodeURIComponent(pageUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/vega/nextdrive?url=https%3A%2F%2Fvegamovies.com%2Fmovie%2Fspiderman-2021" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "title": "Spider-Man: No Way Home",
  "vcloudLinks": [
    {
      "label": "V-Cloud 1080p",
      "url": "https://vcloud.lol/..."
    },
    {
      "label": "V-Cloud 720p",
      "url": "https://vcloud.lol/..."
    }
  ]
}`
  },
  {
    name: "ZinkMovies Home",
    method: "GET",
    endpoint: "/api/zinkmovies",
    provider: "ZinkMovies",
    description: "Get recent movies from ZinkMovies homepage (slider and trending)",
    requiresAuth: true,
    parameters: [
      { name: "page", type: "string", required: false, description: "Page number (default: 1)" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zinkmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface Movie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  rating: string;
  quality: string;
  language: string;
  year: string;
  type: string;
}

interface Response {
  slider: Movie[];
  trending: Movie[];
}

const data: Response = await response.json();
console.log(data);`,
    jsExample: `fetch(\`\${baseUrl}/api/zinkmovies?page=1\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zinkmovies?page=1" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "slider": [
    {
      "id": "joker-2019",
      "title": "Joker",
      "url": "/movie/joker-2019",
      "imageUrl": "https://...",
      "rating": "8.4",
      "quality": "BluRay",
      "language": "English",
      "year": "2019",
      "type": "movie"
    }
  ],
  "trending": [...]
}`
  },
  {
    name: "ZinkMovies Search",
    method: "GET",
    endpoint: "/api/zinkmovies/search",
    provider: "ZinkMovies",
    description: "Search movies on ZinkMovies",
    requiresAuth: true,
    parameters: [
      { name: "q", type: "string", required: true, description: "Search query" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zinkmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const results = await response.json();
console.log(results);`,
    jsExample: `fetch(\`\${baseUrl}/api/zinkmovies/search?q=\${query}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(results => console.log(results))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zinkmovies/search?q=joker" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `[
  {
    "title": "Joker",
    "url": "/movie/joker-2019",
     "imageUrl": "https://...",
    "rating": "8.4"
  }
]`
  },
  {
    name: "ZinkMovies Details",
    method: "GET",
    endpoint: "/api/zinkmovies/details",
    provider: "ZinkMovies",
    description: "Get movie details and download links from ZinkMovies",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Movie URL path" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zinkmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const details = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/zinkmovies/details?url=\${movieUrl}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zinkmovies/details?url=/joker-2019" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "title": "Joker (2019)",
  "imageUrl": "https://...",
  "rating": "8.4",
  "downloadLinks": [
    {
      "quality": "1080p",
      "size": "2.1GB",
      "url": "https://..."
    }
  ]
}`
  },
  {
    name: "ZinkCloud Extract",
    method: "GET",
    endpoint: "/api/zinkmovies/zinkcloud",
    provider: "ZinkMovies",
    description: "Extract file info and HubCloud download links from ZinkCloud URL",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "ZinkCloud URL to extract" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zinkmovies/zinkcloud?url=\${encodeURIComponent(zinkcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface ZinkCloudDetails {
  success: boolean;
  data: {
    fileInfo: {
      fileName: string;
      format: string;
      fileSize: string;
      addedOn: string;
    };
    hubCloudLinks: Array<{
      url: string;
      title: string;
    }>;
  };
}

const details: ZinkCloudDetails = await response.json();
console.log(details);`,
    jsExample: `fetch(\`\${baseUrl}/api/zinkmovies/zinkcloud?url=\${encodeURIComponent(zinkcloudUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(details => console.log(details))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zinkmovies/zinkcloud?url=https%3A%2F%2Fzinkcloud.example%2Ffile" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": {
    "fileInfo": {
      "fileName": "Movie.Name.2024.1080p.WEB-DL.mkv",
      "format": "MKV",
      "fileSize": "2.5 GB",
      "addedOn": "2024-01-15"
    },
    "hubCloudLinks": [
      {
        "url": "https://hubcloud.example/d/abc123",
        "title": "Download Link 1"
      },
      {
        "url": "https://hubcloud.example/d/xyz789",
        "title": "Download Link 2"
      }
    ]
  }
}`
  },
  {
    name: "Nextdrive Episodes Extract",
    method: "GET",
    endpoint: "/api/zeefliz/nextdrive",
    provider: "Zeefliz",
    description: "Extract episode links and ZeeCloud download links from Nextdrive/Zeefliz page URL",
    requiresAuth: true,
    parameters: [
      { name: "url", type: "string", required: true, description: "Nextdrive page URL to extract episodes from" },
    ],
    tsExample: `const response = await fetch(\`\${baseUrl}/api/zeefliz/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

interface NextdriveData {
  success: boolean;
  data: {
    title: string;
    note?: string;
    episodes: Array<{
      episode: string;
      episodeNumber: string;
      url: string;
      type: string; // 'Zee-Cloud' | 'G-Direct' | 'Batch/Zip'
    }>;
    zeeCloudLinks: string[];
  };
}

const episodeData: NextdriveData = await response.json();
console.log(episodeData);`,
    jsExample: `fetch(\`\${baseUrl}/api/zeefliz/nextdrive?url=\${encodeURIComponent(nextdriveUrl)}\`, {
  method: 'GET',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
  .then(response => response.json())
  .then(episodeData => console.log(episodeData))
  .catch(error => console.error('Error:', error));`,
    curlExample: `curl -X GET "https://screenscapeapi.dev/api/zeefliz/nextdrive?url=https%3A%2F%2Fnextdrive.example%2Fshow" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
    responseExample: `{
  "success": true,
  "data": {
    "title": "Show Name Season 1",
    "note": "Note: Use Download Manager for faster downloads",
    "episodes": [
      {
        "episode": "Episode 1",
        "episodeNumber": "1",
        "url": "https://example.com/ep1",
        "type": "Zee-Cloud"
      },
      {
        "episode": "Episode 1",
        "episodeNumber": "1",
        "url": "https://example.com/ep1-direct",
        "type": "G-Direct"
      },
      {
        "episode": "Episode 2",
        "episodeNumber": "2",
        "url": "https://example.com/ep2",
        "type": "Zee-Cloud"
      }
    ],
    "zeeCloudLinks": [
      "https://example.com/ep1",
      "https://example.com/ep2"
    ]
  }
}`
  },
  ...ANIMESALT_ENDPOINTS,
  ...ANIMEPAHE_ENDPOINTS,
  ...CASTEL_ENDPOINTS,
  ...KMMOVIES_ENDPOINTS,
  ...NETMIRROR_ENDPOINTS,
  ...XM_ENDPOINTS,
  ...XX_ENDPOINTS,
  ...XOZ_ENDPOINTS,
  ...XS_ENDPOINTS,
  ...XP_ENDPOINTS,
  ...SB_ENDPOINTS,
  ...ZTEEN_ENDPOINTS,
  ...XV_ENDPOINTS,
  ...FZ_ENDPOINTS,
  ...EXTRACTORS_ENDPOINTS,
  ...UHDMOVIES_ENDPOINTS,
  ...MOD_ENDPOINTS
]

export default function DocumentationPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [language, setLanguage] = useState<"typescript" | "javascript">("typescript")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [testingEndpoint, setTestingEndpoint] = useState<number | null>(null)
  const [testResponse, setTestResponse] = useState<{index: number, data: any, error?: string} | null>(null)
  const [userApiKey, setUserApiKey] = useState<string | null>(null)
  const [editableParams, setEditableParams] = useState<Record<number, Record<string, string>>>({})
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [showVpsWarning, setShowVpsWarning] = useState<boolean>(true)
  
  // Check localStorage for VPS warning dismissal
  useEffect(() => {
    const warningDismissed = localStorage.getItem('vps-warning-dismissed')
    if (warningDismissed === 'true') {
      setShowVpsWarning(false)
    }
  }, [])
  
  const dismissVpsWarning = () => {
    localStorage.setItem('vps-warning-dismissed', 'true')
    setShowVpsWarning(false)
  }
  
  // Fetch user's API key on mount - we get the masked version for display only
  useEffect(() => {
    const fetchApiKey = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/keys', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const keys = await response.json()
          // Find first active key - this will be masked for display
          const activeKey = keys.find((k: any) => k.isActive)
          if (activeKey) {
            // Store the masked key for display purposes
            // The actual key will be retrieved server-side via session when testing
            setUserApiKey(activeKey.key)
          }
        }
      } catch (error) {
        console.error('Failed to fetch API keys:', error)
      }
    }

    if (session) {
      fetchApiKey()
    }
  }, [session])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const updateParam = (endpointIndex: number, paramName: string, value: string) => {
    setEditableParams(prev => ({
      ...prev,
      [endpointIndex]: {
        ...prev[endpointIndex],
        [paramName]: value
      }
    }))
  }

  // Get code example with user's API key (masked for display)
  const getCodeExample = (endpoint: ApiEndpoint, language: 'typescript' | 'javascript') => {
    const example = language === 'typescript' ? endpoint.tsExample : endpoint.jsExample
    // Show masked key if available, otherwise show placeholder
    const displayKey = userApiKey || 'YOUR_API_KEY'
    return example.replace(/YOUR_API_KEY/g, displayKey)
  }

  const getCurlExample = (endpoint: ApiEndpoint) => {
    // Show masked key if available, otherwise show placeholder
    const displayKey = userApiKey || 'YOUR_API_KEY'
    return endpoint.curlExample.replace(/YOUR_API_KEY/g, displayKey)
  }

  const testEndpoint = async (endpoint: ApiEndpoint, index: number) => {
    // Check if user is authenticated
    if (!session?.user) {
      router.push('/login')
      return
    }

    // Check if user has an active API key
    if (!userApiKey) {
      setTestResponse({ 
        index, 
        data: null, 
        error: 'No active API key found. Please create an API key from the APIs page first.' 
      })
      return
    }

    setTestingEndpoint(index)
    setTestResponse(null)

    try {
      // Build URL with user's parameters or defaults
      let url = endpoint.endpoint
      if (endpoint.parameters && endpoint.parameters.length > 0) {
        const params = new URLSearchParams()
        endpoint.parameters.forEach(param => {
          const userValue = editableParams[index]?.[param.name]
          if (userValue) {
            params.append(param.name, userValue)
          } else {
            // Default values
            if (param.name === 'q') params.append('q', 'test')
            if (param.name === 'url') params.append('url', '/test')
            if (param.name === 'page') params.append('page', '1')
          }
        })
        url += `?${params.toString()}`
      }

      // Don't send x-api-key header - the backend will use session authentication
      // via the validateApiKey function which checks session when no key is provided
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        credentials: 'include' // Important: include credentials for session
      })

      const data = await response.json()
      
      if (!response.ok) {
        setTestResponse({ 
          index, 
          data: null, 
          error: data.error || data.message || `Request failed with status ${response.status}` 
        })
      } else {
        setTestResponse({ index, data })
      }
    } catch (error) {
      setTestResponse({ 
        index, 
        data: null, 
        error: error instanceof Error ? error.message : 'Failed to fetch' 
      })
    } finally {
      setTestingEndpoint(null)
    }
  }

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">API Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Complete reference for all available API endpoints with code examples
            </p>
          </div>
          <Link 
            href="https://github.com/Anshu78780/ScarperApi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black dark:bg-zinc-900 border-2 border-zinc-800 dark:border-zinc-700 rounded-lg px-4 py-2 hover:bg-zinc-900 dark:hover:bg-zinc-800 transition-colors shadow-lg"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium text-white">Give Star ⭐</span>
          </Link>
        </div>
        <Card className="mt-4 p-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">ScreenScape App</h3>
              <p className="text-sm text-muted-foreground">
                Download the official ScreenScape app for the best experience
              </p>
            </div>
            <Link
              href="https://screenscape.fun/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download App
              </Button>
            </Link>
          </div>
        </Card>
        {session?.user && userApiKey && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Your API key ({userApiKey}) is active. You can test endpoints using your session.
            </p>
          </div>
        )}
        {session?.user && !userApiKey && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠ To test endpoints, please create an API key from the <a href="/dashboard/apis" className="underline font-medium">APIs page</a>.
            </p>
          </div>
        )}
      </div>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium">Language:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {language === "typescript" ? "TypeScript" : "JavaScript"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLanguage("typescript")}>
              TypeScript
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage("javascript")}>
              JavaScript
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-sm font-medium ml-6">Provider:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between">
              {selectedProvider ? selectedProvider : "All Providers"}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem key="all-providers" onClick={() => setSelectedProvider(null)}>
              {selectedProvider === null && <Check className="h-4 w-4 mr-2" />}
              All Providers
            </DropdownMenuItem>
            {Array.from(new Set(API_ENDPOINTS.map(e => e.provider))).sort().map((provider) => (
              <DropdownMenuItem key={provider} onClick={() => setSelectedProvider(provider)}>
                {selectedProvider === provider && <Check className="h-4 w-4 mr-2" />}
                {provider}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-6">
        {API_ENDPOINTS.filter((endpoint) => 
          selectedProvider ? endpoint.provider === selectedProvider : true
        ).map((endpoint, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {endpoint.name}
                    <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>
                      {endpoint.method}
                    </Badge>
                    {endpoint.requiresAuth && (
                      <Badge variant="outline" className="text-xs">
                        🔒 Auth Required
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {endpoint.description}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-3">
                <code className="text-sm bg-muted px-3 py-1.5 rounded-md font-mono">
                  {endpoint.endpoint}
                </code>
              </div>
              
              {/* IP-Based Streaming Warning for XS and AnimeSalt Providers */}
              {(endpoint.provider === "Adult (XS)" || endpoint.provider?.includes("XS") || endpoint.provider === "AnimeSalt") && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                        IP-Based Streaming Notice
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        This provider uses IP-based streaming. If you fetch the stream URL from your VPS or server, 
                        you must play the video through that same server. The stream URL is tied to the IP address 
                        that requested it and cannot be played from a different location.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Header Requirements Warning for AnimePahe Stream Endpoint */}
              {endpoint.provider === "AnimePahe" && endpoint.endpoint.includes("/stream") && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-1">
                        Required Headers for Playback
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                        The m3u8 stream URL returned by this endpoint requires specific headers to play properly:
                      </p>
                      <div className="bg-yellow-950/20 p-3 rounded border border-yellow-500/30">
                        <code className="text-xs font-mono text-yellow-600 dark:text-yellow-300">
                          Referer: https://kwik.cx/<br />
                          Origin: https://kwik.cx
                        </code>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                        Without these headers, the stream will not work. Make sure to include them in your video player or fetch request.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Parameters</h4>
                  <div className="space-y-3">
                    {endpoint.parameters.map((param, pidx) => (
                      <div key={pidx} className="space-y-2">
                        <div className="flex items-start gap-3 text-sm">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                            {param.name}
                          </code>
                          <Badge variant="outline" className="text-xs">
                            {param.type}
                          </Badge>
                          {param.required && (
                            <Badge variant="destructive" className="text-xs">
                              required
                            </Badge>
                          )}
                          <span className="text-muted-foreground">{param.description}</span>
                        </div>
                        <input
                          type="text"
                          placeholder={param.name === 'q' ? 'Enter search query...' : param.name === 'url' ? 'Enter URL path...' : `Enter ${param.name}...`}
                          value={editableParams[index]?.[param.name] || ''}
                          onChange={(e) => updateParam(index, param.name, e.target.value)}
                          className="w-full px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Tabs defaultValue="code" className="w-full">
                <TabsList>
                  <TabsTrigger value="code">Code Example</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="code" className="space-y-3">
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(
                          getCodeExample(endpoint, language),
                          index * 10
                        )}
                      >
                        {copiedIndex === index * 10 ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => testEndpoint(endpoint, index)}
                        disabled={testingEndpoint === index}
                      >
                        {testingEndpoint === index ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Try it
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code className="language-typescript">
                        {language === "typescript" ? (
                          <SyntaxHighlight code={getCodeExample(endpoint, 'typescript')} lang="typescript" />
                        ) : (
                          <SyntaxHighlight code={getCodeExample(endpoint, 'javascript')} lang="javascript" />
                        )}
                      </code>
                    </pre>
                  </div>

                  {testResponse && testResponse.index === index && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        Response
                        <Badge variant={testResponse.error ? "destructive" : "default"}>
                          {testResponse.error ? "Error" : "Success"}
                        </Badge>
                      </h4>
                      <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>
                          {testResponse.error ? (
                            <span className="text-red-400">{testResponse.error}</span>
                          ) : (
                            <SyntaxHighlight 
                              code={JSON.stringify(testResponse.data, null, 2)} 
                              lang="json" 
                            />
                          )}
                        </code>
                      </pre>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="curl">
                  <div className="relative">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="absolute top-3 right-3 z-10"
                      onClick={() => copyToClipboard(getCurlExample(endpoint), index * 10 + 1)}
                    >
                      {copiedIndex === index * 10 + 1 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>
                        <SyntaxHighlight code={getCurlExample(endpoint)} lang="bash" />
                      </code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="response">
                  <div className="relative">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="absolute top-3 right-3 z-10"
                      onClick={() => copyToClipboard(endpoint.responseExample, index * 10 + 2)}
                    >
                      {copiedIndex === index * 10 + 2 ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>
                        <SyntaxHighlight code={endpoint.responseExample} lang="json" />
                      </code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* VPS/Proxy Warning AlertDialog */}
      <AlertDialog open={showVpsWarning} onOpenChange={setShowVpsWarning}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Important: VPS & Proxy Notice
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-base">
                <div className="text-foreground">
                  Some providers may not work properly when accessed from VPS servers or cloud hosting. 
                  This is due to regional restrictions and IP-based blocking implemented by the source websites.
                </div>
                <div>
                  <div className="font-semibold text-foreground mb-2">
                    Recommended Solutions:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                    <li>Use a proxy service with residential IPs</li>
                    <li>Host your application on a local server or personal network</li>
                    <li>Use a VPN with IP rotation capabilities</li>
                    <li>Consider using rotating proxy services for production environments</li>
                  </ul>
              <p className="text-sm text-muted-foreground italic">
                Click &ldquo;I Understand&rdquo; to dismiss this message. It won&apos;t be shown again.
              </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={dismissVpsWarning} 
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Educational Purpose Disclaimer */}
      <div className="mt-12 mb-8">
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg 
                  className="h-8 w-8 text-yellow-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-3">
                  ⚠️ Educational Purpose & Legal Disclaimer
                </h3>
                <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
                  <p>
                    <strong>This project is intended for educational purposes only.</strong> It is designed to demonstrate 
                    web scraping techniques, API development, and full-stack application architecture.
                  </p>
                  <p>
                    We do not claim ownership of any content, media, or materials accessed through this API. 
                    All rights to the original content belong to their respective owners and providers.
                  </p>
                  <p>
                    By using this API, you acknowledge that:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>You are responsible for complying with all applicable laws and regulations in your jurisdiction</li>
                    <li>This service is provided &quot;as is&quot; without warranties of any kind</li>
                    <li>The developers and contributors are not liable for any misuse of this API</li>
                    <li>You will respect copyright laws and terms of service of the source websites</li>
                    <li>This API should not be used for commercial purposes without proper authorization</li>
                  </ul>
                  <p className="mt-3 font-semibold">
                    Use this API responsibly and at your own risk. If you are a content owner and wish to have your 
                    content removed, please contact the project maintainers.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Syntax highlighting component
function SyntaxHighlight({ code, lang }: { code: string; lang: string }) {
  const keywords = ['const', 'let', 'var', 'function', 'async', 'await', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'interface', 'type', 'class', 'new', 'try', 'catch', 'throw']
  const types = ['string', 'number', 'boolean', 'any', 'void', 'Array', 'Promise', 'Response']
  
  if (lang === 'json') {
    return (
      <span>
        {code.split('\n').map((line, i) => (
          <div key={i}>
            {line.split(/(".*?":?|true|false|null|\d+)/).map((part, j) => {
              if (part.match(/^".*":$/)) {
                return <span key={j} className="text-blue-400">{part}</span>
              }
              if (part.match(/^".*"$/)) {
                return <span key={j} className="text-green-400">{part}</span>
              }
              if (part.match(/^(true|false|null)$/)) {
                return <span key={j} className="text-purple-400">{part}</span>
              }
              if (part.match(/^\d+$/)) {
                return <span key={j} className="text-orange-400">{part}</span>
              }
              return <span key={j}>{part}</span>
            })}
          </div>
        ))}
      </span>
    )
  }

  if (lang === 'bash') {
    return (
      <span>
        {code.split('\n').map((line, i) => (
          <div key={i}>
            {line.split(/(-[HXd]|curl|"[^"]*")/).map((part, j) => {
              if (part === 'curl') {
                return <span key={j} className="text-purple-400">{part}</span>
              }
              if (part.match(/^-[HXd]$/)) {
                return <span key={j} className="text-blue-400">{part}</span>
              }
              if (part.match(/^".*"$/)) {
                return <span key={j} className="text-green-400">{part}</span>
              }
              return <span key={j}>{part}</span>
            })}
          </div>
        ))}
      </span>
    )
  }

  return (
    <span>
      {code.split('\n').map((line, i) => (
        <div key={i}>
          {line.split(/(\s+|[{}()\[\];,.]|'[^']*'|"[^"]*"|`[^`]*`|\/\/.*$)/).map((part, j) => {
            if (keywords.includes(part)) {
              return <span key={j} className="text-purple-400">{part}</span>
            }
            if (types.includes(part)) {
              return <span key={j} className="text-cyan-400">{part}</span>
            }
            if (part.match(/^['"`].*['"`]$/)) {
              return <span key={j} className="text-green-400">{part}</span>
            }
            if (part.match(/^\/\/.*/)) {
              return <span key={j} className="text-gray-500">{part}</span>
            }
            if (part.match(/^[A-Z][a-zA-Z]*$/)) {
              return <span key={j} className="text-yellow-400">{part}</span>
            }
            return <span key={j}>{part}</span>
          })}
        </div>
      ))}
    </span>
  )
}
