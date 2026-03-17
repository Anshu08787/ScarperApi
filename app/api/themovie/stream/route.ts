import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface StreamResponse {
  success: boolean;
  originalUrl?: string;
  convertedUrl?: string;
  detailUrl?: string;
  apiUrl?: string;
  movieImage?: string;
  playbackHeaders?: Record<string, string>;
  data?: unknown;
  error?: string;
}

interface ParsedStreamInput {
  slug: string;
  id: string;
  type: string;
  urlSeason: string | null;
  urlEpisode: string | null;
  convertedUrl: URL;
  detailUrl: string;
  apiUrl: URL;
}

function buildConvertedUrl(slug: string, id: string, type: string, season?: string | null, episode?: string | null) {
  const convertedUrl = new URL(`https://themoviebox.org/movies/${slug}`);
  convertedUrl.searchParams.set('id', id);
  convertedUrl.searchParams.set('type', type);

  if (season) {
    convertedUrl.searchParams.set('detailSe', season);
    convertedUrl.searchParams.set('detailEp', episode || '1');
  }

  convertedUrl.searchParams.set('lang', 'en');
  return convertedUrl;
}

function buildDetailUrl(slug: string, id: string, type: string, season?: string | null, episode?: string | null) {
  const detailUrl = new URL(`https://themoviebox.org/moviesDetail/${slug}`);
  detailUrl.searchParams.set('id', id);
  detailUrl.searchParams.set('type', type);

  if (season) {
    detailUrl.searchParams.set('season', season);
    detailUrl.searchParams.set('episode', episode || '1');
  }

  return detailUrl.toString();
}

function normalizeInputUrlFromOuterParams(inputUrl: string, outerSearchParams: URLSearchParams) {
  const normalizedUrl = new URL(inputUrl);
  const isDirectPlayUrl =
    normalizedUrl.pathname === '/wefeed-h5api-bff/subject/play' ||
    normalizedUrl.pathname.endsWith('/wefeed-h5api-bff/subject/play');

  if (!isDirectPlayUrl) {
    return inputUrl;
  }

  const outerSubjectId = outerSearchParams.get('subjectId');
  const outerSeason = outerSearchParams.get('se');
  const outerEpisode = outerSearchParams.get('ep');
  const outerDetailPath = outerSearchParams.get('detailPath');

  if (!normalizedUrl.searchParams.get('subjectId') && outerSubjectId) {
    normalizedUrl.searchParams.set('subjectId', outerSubjectId);
  }
  if (!normalizedUrl.searchParams.get('se') && outerSeason) {
    normalizedUrl.searchParams.set('se', outerSeason);
  }
  if (!normalizedUrl.searchParams.get('ep') && outerEpisode) {
    normalizedUrl.searchParams.set('ep', outerEpisode);
  }
  if (!normalizedUrl.searchParams.get('detailPath') && outerDetailPath) {
    normalizedUrl.searchParams.set('detailPath', outerDetailPath);
  }

  return normalizedUrl.toString();
}

function parseInputUrl(inputUrl: string, customSeason?: string | null, customEpisode?: string | null): ParsedStreamInput {
  const url = new URL(inputUrl);
  const pathParts = url.pathname.split('/');

  if (pathParts[1] === 'moviesDetail') {
    const slug = pathParts[2];
    const id = url.searchParams.get('id');
    const urlSeason = url.searchParams.get('season');
    const urlEpisode = url.searchParams.get('episode');
    const type = url.searchParams.get('type') || '/movie/detail';

    if (!slug || !id) {
      throw new Error('ID parameter is required in the URL');
    }

    const finalSeason = customSeason || urlSeason;
    const finalEpisode = customEpisode || urlEpisode || '1';
    const convertedUrl = buildConvertedUrl(slug, id, type, finalSeason, finalEpisode);
    const apiUrl = new URL('https://themoviebox.org/wefeed-h5api-bff/subject/play');
    apiUrl.searchParams.set('subjectId', id);
    apiUrl.searchParams.set('se', finalSeason || '0');
    apiUrl.searchParams.set('ep', finalSeason ? finalEpisode : '0');
    apiUrl.searchParams.set('detailPath', slug);

    return {
      slug,
      id,
      type,
      urlSeason,
      urlEpisode,
      convertedUrl,
      detailUrl: buildDetailUrl(slug, id, type, finalSeason, finalEpisode),
      apiUrl,
    };
  }

  if (pathParts[1] === 'wefeed-h5api-bff' && pathParts[2] === 'subject' && pathParts[3] === 'play') {
    const slug = url.searchParams.get('detailPath');
    const id = url.searchParams.get('subjectId');
    const urlSeason = url.searchParams.get('se');
    const urlEpisode = url.searchParams.get('ep');
    const type = '/movie/detail';

    if (!slug || !id) {
      throw new Error('subjectId and detailPath are required in the API URL');
    }

    const finalSeason = customSeason || urlSeason;
    const finalEpisode = customEpisode || urlEpisode || '1';
    const convertedUrl = buildConvertedUrl(slug, id, type, finalSeason, finalEpisode);
    const apiUrl = new URL('https://themoviebox.org/wefeed-h5api-bff/subject/play');
    apiUrl.searchParams.set('subjectId', id);
    apiUrl.searchParams.set('se', finalSeason || '0');
    apiUrl.searchParams.set('ep', finalEpisode || '0');
    apiUrl.searchParams.set('detailPath', slug);

    return {
      slug,
      id,
      type,
      urlSeason,
      urlEpisode,
      convertedUrl,
      detailUrl: buildDetailUrl(slug, id, type, finalSeason, finalEpisode),
      apiUrl,
    };
  }

  throw new Error('Invalid URL format. Expected /moviesDetail/ or /wefeed-h5api-bff/subject/play path');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawInputUrl = searchParams.get("url");
    const customSeason = searchParams.get("season"); // Allow season override via query param
    const customEpisode = searchParams.get("episode"); // Allow episode override via query param

    if (!rawInputUrl) {
      return NextResponse.json({
        success: false,
        error: "URL parameter is required"
      } as StreamResponse, { status: 400 });
    }

    const inputUrl = normalizeInputUrlFromOuterParams(rawInputUrl, searchParams);

    let parsedInput: ParsedStreamInput;
    try {
      parsedInput = parseInputUrl(inputUrl, customSeason, customEpisode);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: parseError instanceof Error ? parseError.message : 'Invalid URL parameter'
      } as StreamResponse, { status: 400 });
    }

    const { convertedUrl, apiUrl, detailUrl, urlSeason, urlEpisode } = parsedInput;
    const finalSeason = customSeason || urlSeason;
    const finalEpisode = customEpisode || urlEpisode || (finalSeason ? '1' : '0');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': 'mb_token=%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEzMzI1MTYyOTA2MjM4NTEyMDgsImF0cCI6MywiZXh0IjoiMTc2OTU3NDU3NyIsImV4cCI6MTc3NzM1MDU3NywiaWF0IjoxNzY5NTc0Mjc3fQ.Gc4HmKDugVKcWSGoxtCqBTWdZix5dvRpp_22_Z7-7Vk%22; i18n_lang=en',
        'Priority': 'u=1, i',
        'Referer': convertedUrl.toString(),
        'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Gpc': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'X-Client-Info': '{"timezone":"Asia/Calcutta"}',
        'X-Source': 'h5'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        originalUrl: inputUrl,
        convertedUrl: convertedUrl.toString(),
        detailUrl,
        apiUrl: apiUrl.toString(),
        error: `API request failed with status: ${response.status}`
      } as StreamResponse, { status: response.status });
    }

    const data = await response.json();
    const playbackHeaders = {
      Referer: convertedUrl.toString(),
    };
    const enrichedData =
      data && typeof data === 'object'
        ? { ...(data as Record<string, unknown>), playbackHeaders }
        : data;

    // Optionally fetch movie image from the detail page
    let movieImage = '';
    try {
      const detailResponse = await fetch(detailUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      
      if (detailResponse.ok) {
        const detailHtml = await detailResponse.text();
        const $ = cheerio.load(detailHtml);
        
        // Extract image from the movie detail page
        const imgElement = $('.card-cover img, .movie-poster img, img[alt*="full"]').first();
        movieImage = imgElement.attr('src') || imgElement.attr('data-src') || '';
      }
    } catch (imageError) {
      console.warn('Failed to fetch movie image:', imageError);
      // Continue without image - not critical
    }

    return NextResponse.json({
      success: true,
      originalUrl: inputUrl,
      convertedUrl: convertedUrl.toString(),
      detailUrl,
      apiUrl: apiUrl.toString(),
      movieImage,
      playbackHeaders,
      extractedParams: {
        urlSeason,
        urlEpisode,
        finalSeason,
        finalEpisode
      },
      data: enrichedData
    } as StreamResponse);

  } catch (error) {
    console.error("Error in TheMovie Stream API:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    } as StreamResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url: inputUrl, season: customSeason, episode: customEpisode } = body;

    if (!inputUrl) {
      return NextResponse.json({
        success: false,
        error: "URL is required in request body"
      } as StreamResponse, { status: 400 });
    }

    let parsedInput: ParsedStreamInput;
    try {
      parsedInput = parseInputUrl(inputUrl, customSeason, customEpisode);
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: parseError instanceof Error ? parseError.message : 'Invalid URL parameter'
      } as StreamResponse, { status: 400 });
    }

    const { convertedUrl, apiUrl, detailUrl } = parsedInput;

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Cookie': 'mb_token=%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEzMzI1MTYyOTA2MjM4NTEyMDgsImF0cCI6MywiZXh0IjoiMTc2OTU3NDU3NyIsImV4cCI6MTc3NzM1MDU3NywiaWF0IjoxNzY5NTc0Mjc3fQ.Gc4HmKDugVKcWSGoxtCqBTWdZix5dvRpp_22_Z7-7Vk%22; i18n_lang=en',
        'Priority': 'u=1, i',
        'Referer': convertedUrl.toString(),
        'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Gpc': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'X-Client-Info': '{"timezone":"Asia/Calcutta"}',
        'X-Source': 'h5'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        originalUrl: inputUrl,
        convertedUrl: convertedUrl.toString(),
        detailUrl,
        apiUrl: apiUrl.toString(),
        error: `API request failed with status: ${response.status}`
      } as StreamResponse, { status: response.status });
    }

    const data = await response.json();
    const playbackHeaders = {
      Referer: convertedUrl.toString(),
    };
    const enrichedData =
      data && typeof data === 'object'
        ? { ...(data as Record<string, unknown>), playbackHeaders }
        : data;

    // Optionally fetch movie image from the detail page
    let movieImage = '';
    try {
      const detailResponse = await fetch(detailUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        }
      });
      
      if (detailResponse.ok) {
        const detailHtml = await detailResponse.text();
        const $ = cheerio.load(detailHtml);
        
        // Extract image from the movie detail page
        const imgElement = $('.card-cover img, .movie-poster img, img[alt*="full"]').first();
        movieImage = imgElement.attr('src') || imgElement.attr('data-src') || '';
      }
    } catch (imageError) {
      console.warn('Failed to fetch movie image:', imageError);
      // Continue without image - not critical
    }

    return NextResponse.json({
      success: true,
      originalUrl: inputUrl,
      convertedUrl: convertedUrl.toString(),
      detailUrl,
      apiUrl: apiUrl.toString(),
      movieImage,
      playbackHeaders,
      customParams: {
        season: customSeason,
        episode: customEpisode
      },
      data: enrichedData
    } as StreamResponse);

  } catch (error) {
    console.error("Error in TheMovie Stream POST API:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    } as StreamResponse, { status: 500 });
  }
}