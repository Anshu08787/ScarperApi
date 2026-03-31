import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/baseurl';
import * as cheerio from 'cheerio';

interface SearchResult {
  title: string;
  href: string;
  fullUrl: string;
  imageUrl: string;
  rating: string;
  imdbRating?: string;
  imdbRatingCount?: number;
}

interface SearchResponse {
  success: boolean;
  query?: string;
  baseUrl?: string;
  searchUrl?: string;
  totalResults?: number;
  results?: SearchResult[];
  error?: string;
}

interface ImdbMeta {
  imdbRating?: string;
  imdbRatingCount?: number;
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/^moviesDetail\//i, '')
    .toLowerCase();
}

function toImdbRating(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const parsed = value.trim();
    return parsed || undefined;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return undefined;
}

function toImdbCount(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getDetailSlug(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/^\/moviesDetail\/([^/?#]+)/i);
    return match?.[1] ? normalizeSlug(match[1]) : undefined;
  } catch {
    return undefined;
  }
}

function extractImdbLookupFromNuxt(html: string) {
  const bySlug = new Map<string, ImdbMeta>();
  const byTitle = new Map<string, ImdbMeta>();

  const match = html.match(/<script[^>]+id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) {
    return { bySlug, byTitle };
  }

  let raw: unknown[];
  try {
    raw = JSON.parse(match[1]) as unknown[];
  } catch {
    return { bySlug, byTitle };
  }

  const cache = new Map<number, unknown>();
  function resolve(index: number): unknown {
    if (!Number.isInteger(index) || index < 0 || index >= raw.length) return undefined;
    if (cache.has(index)) return cache.get(index);

    const value = raw[index];
    if (value === null || value === undefined || typeof value !== 'object') {
      cache.set(index, value);
      return value;
    }

    if (Array.isArray(value)) {
      if (value[0] === 'ShallowReactive' || value[0] === 'Reactive') {
        const resolvedReactive = resolve(value[1] as number);
        cache.set(index, resolvedReactive);
        return resolvedReactive;
      }
      if (value[0] === 'Set') {
        const resolvedSet = value.slice(1).map((entry: unknown) =>
          typeof entry === 'number' ? resolve(entry) : entry
        );
        cache.set(index, resolvedSet);
        return resolvedSet;
      }

      const resolvedArray: unknown[] = [];
      cache.set(index, resolvedArray);
      value.forEach((entry: unknown) => resolvedArray.push(typeof entry === 'number' ? resolve(entry) : entry));
      return resolvedArray;
    }

    const resolvedObject: Record<string, unknown> = {};
    cache.set(index, resolvedObject);
    for (const [key, entry] of Object.entries(value)) {
      resolvedObject[key] = typeof entry === 'number' ? resolve(entry) : entry;
    }
    return resolvedObject;
  }

  const visited = new WeakSet<object>();

  const upsert = (map: Map<string, ImdbMeta>, key: string, value: ImdbMeta) => {
    const existing = map.get(key);
    if (!existing) {
      map.set(key, value);
      return;
    }

    map.set(key, {
      imdbRating: existing.imdbRating ?? value.imdbRating,
      imdbRatingCount: existing.imdbRatingCount ?? value.imdbRatingCount,
    });
  };

  const capture = (entry: Record<string, unknown>) => {
    const imdbRating = toImdbRating(entry.imdbRatingValue);
    const imdbRatingCount = toImdbCount(entry.imdbRatingCount);
    if (!imdbRating && imdbRatingCount === undefined) {
      return;
    }

    const detailPath = typeof entry.detailPath === 'string' ? normalizeSlug(entry.detailPath) : undefined;
    const title = typeof entry.title === 'string' ? normalizeTitle(entry.title) : undefined;

    const imdbMeta: ImdbMeta = { imdbRating, imdbRatingCount };

    if (detailPath) {
      upsert(bySlug, detailPath, imdbMeta);
    }
    if (title) {
      upsert(byTitle, title, imdbMeta);
    }
  };

  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (visited.has(node)) {
      return;
    }
    visited.add(node);

    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;
    capture(record);

    if (record.subject && typeof record.subject === 'object' && !Array.isArray(record.subject)) {
      capture(record.subject as Record<string, unknown>);
    }

    Object.values(record).forEach(walk);
  };

  for (let i = 0; i < raw.length; i += 1) {
    walk(resolve(i));
  }

  return { bySlug, byTitle };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Query parameter 'q' or 'query' is required"
      } as SearchResponse, { status: 400 });
    }

    const baseUrl = await getBaseUrl('moviebox');
    
    const searchUrlObj = new URL('newWeb/searchResult', baseUrl);
    searchUrlObj.searchParams.set('keyword', query);
    const searchUrl = searchUrlObj.toString();

    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Gpc': '1'
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        query,
        baseUrl,
        searchUrl,
        error: `Failed to fetch search results: ${response.status} ${response.statusText}`
      } as SearchResponse, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);
  const imdbLookup = extractImdbLookupFromNuxt(html);
    
    const results: SearchResult[] = [];
    
    $('a.card[href^="/moviesDetail/"]').each((_, element) => {
      const $card = $(element);
      
      const href = $card.attr('href') || '';
      
      const title = $card.find('h2.card-title').attr('title') || $card.find('h2.card-title').text().trim();
      
      let imageUrl = '';
      const imgElement = $card.find('img').first();
      if (imgElement.length) {
        imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || '';
      }
      
      const rating = $card.find('span.rate').text().trim();
      
      if (title && href) {
        const fullUrl = href.startsWith('http') ? href : new URL(href, baseUrl).toString();
        const slug = getDetailSlug(fullUrl);
        const imdbMeta =
          (slug ? imdbLookup.bySlug.get(slug) : undefined) ?? imdbLookup.byTitle.get(normalizeTitle(title));

        results.push({
          title,
          href,
          fullUrl,
          imageUrl,
          rating,
          imdbRating: imdbMeta?.imdbRating ?? (rating || undefined),
          imdbRatingCount: imdbMeta?.imdbRatingCount
        });
      }
    });

    return NextResponse.json({
      success: true,
      query,
      baseUrl,
      searchUrl,
      
      totalResults: results.length,
      results
    } as SearchResponse);

  } catch (error) {
    console.error("Error in TheMovie Search API:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    } as SearchResponse, { status: 500 });
  }
}