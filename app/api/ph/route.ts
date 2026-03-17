import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface VideoItem {
  quality: string;
  file_size: number;
  token?: string;
  url?: string;
}

interface PhResponse {
  title: string;
  thumbnail: string;
  duration: number;
  video: VideoItem[];
  endpoint: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const targetApi = 'https://pornhubfans.com/resolve';
    
    const response = await axios.post(
      targetApi,
      { url, source: 'phfans' },
      {
        headers: {
          'content-type': 'application/json',
          'origin': 'https://pornhubfans.com',
          'priority': 'u=1, i',
          'referer': 'https://pornhubfans.com/',
          'sec-ch-ua': '"Not:A-Brand";v="99", "Brave";v="145", "Chromium";v="145"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'sec-gpc': '1',
          'user-agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'
        }
      }
    );

    const data = response.data as PhResponse;
    const endpoint = data.endpoint;

    if (endpoint && Array.isArray(data.video)) {
      data.video = data.video.map(({ token, ...rest }: VideoItem) => ({
        ...rest,
        ...(token ? { url: `${endpoint}/video?token=${token}` } : {}),
      }));
    }

    const formattedData = data;

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching pornhub data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
