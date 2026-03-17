import { NextRequest, NextResponse } from 'next/server';

const PLAY_COOKIE =
  'mb_token=%22eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEzMzI1MTYyOTA2MjM4NTEyMDgsImF0cCI6MywiZXh0IjoiMTc2OTU3NDU3NyIsImV4cCI6MTc3NzM1MDU3NywiaWF0IjoxNzY5NTc0Mjc3fQ.Gc4HmKDugVKcWSGoxtCqBTWdZix5dvRpp_22_Z7-7Vk%22; i18n_lang=en';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

function buildPlayApiUrl(subjectId: string, season: number, episode: number, detailPath: string) {
  const playUrl = new URL('https://themoviebox.org/wefeed-h5api-bff/subject/play');
  playUrl.searchParams.set('subjectId', subjectId);
  playUrl.searchParams.set('se', String(season));
  playUrl.searchParams.set('ep', String(episode));
  playUrl.searchParams.set('detailPath', detailPath);
  return playUrl.toString();
}

/** Extract the movie/show metadata and resource info from the page HTML */
function parseNuxtData(html: string) {
  const match = html.match(
    /<script[^>]+id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  let raw: unknown[];
  try {
    raw = JSON.parse(match[1]) as unknown[];
  } catch {
    return null;
  }

  // Directly find the payload object — it has subject + resource + stars as numeric refs
  const payloadIdx = raw.findIndex(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      'subject' in (item as object) &&
      'resource' in (item as object) &&
      'stars' in (item as object)
  );
  if (payloadIdx === -1) return null;

  // Cached resolver: numeric values in objects/arrays are pointer indices into `raw`
  const cache = new Map<number, unknown>();
  function r(idx: number): unknown {
    if (!Number.isInteger(idx) || idx < 0 || idx >= raw.length) return undefined;
    if (cache.has(idx)) return cache.get(idx);
    const v = raw[idx];
    if (v === null || v === undefined || typeof v !== 'object') {
      cache.set(idx, v);
      return v;
    }
    if (Array.isArray(v)) {
      if (v[0] === 'ShallowReactive' || v[0] === 'Reactive') {
        const res = r(v[1] as number);
        cache.set(idx, res);
        return res;
      }
      if (v[0] === 'Set') {
        const res: unknown[] = v.slice(1).map((x: unknown) => (typeof x === 'number' ? r(x) : x));
        cache.set(idx, res);
        return res;
      }
      const res: unknown[] = [];
      cache.set(idx, res); // pre-set before recursing to handle circular refs
      v.forEach((x: unknown) => res.push(typeof x === 'number' ? r(x) : x));
      return res;
    }
    const res: Record<string, unknown> = {};
    cache.set(idx, res); // pre-set before recursing to handle circular refs
    for (const [k, val] of Object.entries(v)) {
      res[k] = typeof val === 'number' ? r(val) : val;
    }
    return res;
  }

  const payload = r(payloadIdx) as Record<string, unknown> | undefined;
  if (!payload?.subject) return null;

  const subject = payload.subject as Record<string, unknown>;
  const resource = payload.resource as Record<string, unknown> | undefined;
  const subjectId = subject.subjectId as string | undefined;
  const detailPath = subject.detailPath as string | undefined;

  // Build season/episode map
  const seasons: Array<{
    season: number;
    episode: number;
    episodes: number;
    resolutions: number[];
    playApiUrl?: string;
  }> = [];
  if (resource?.seasons && Array.isArray(resource.seasons)) {
    for (const s of resource.seasons as Record<string, unknown>[]) {
      const resArr = Array.isArray(s.resolutions)
        ? (s.resolutions as Record<string, unknown>[]).map((res) => res.resolution).filter(Boolean) as number[]
        : [];
      const seasonNumber = (s.se as number) ?? 0;
      const totalEpisodes = (s.maxEp as number) ?? 0;
      const episodeStart = seasonNumber > 0 ? 1 : 0;
      const episodeEnd = totalEpisodes > 0 ? totalEpisodes : episodeStart;

      for (let episodeNumber = episodeStart; episodeNumber <= episodeEnd; episodeNumber += 1) {
        seasons.push({
          season: seasonNumber,
          episode: episodeNumber,
          episodes: totalEpisodes,
          resolutions: resArr,
          playApiUrl:
            subjectId && detailPath
              ? buildPlayApiUrl(subjectId, seasonNumber, episodeNumber, detailPath)
              : undefined,
        });
      }
    }
  }

  const cover = subject.cover as Record<string, unknown> | undefined;
  const trailer = subject.trailer as Record<string, unknown> | undefined;
  const trailerVideoAddress = trailer?.videoAddress as Record<string, unknown> | undefined;

  return {
    subjectId,
    subjectType: subject.subjectType as number | undefined, // 1 = movie, 2 = tv series
    title: subject.title as string | undefined,
    description: subject.description as string | undefined,
    releaseDate: subject.releaseDate as string | undefined,
    genre: subject.genre as string | undefined,
    coverUrl: cover?.url as string | undefined,
    country: subject.countryName as string | undefined,
    imdbRating: subject.imdbRatingValue as string | undefined,
    imdbRatingCount: subject.imdbRatingCount as number | undefined,
    subtitles: subject.subtitles as string | undefined,
    dubs: Array.isArray(subject.dubs)
      ? (subject.dubs as Record<string, unknown>[]).map((d) => ({ name: d.lanName, code: d.lanCode, subjectId: d.subjectId, detailPath: d.detailPath }))
      : [],
    detailPath,
    trailerUrl: trailerVideoAddress?.url as string | undefined,
    source: resource?.source as string | undefined,
    seasons,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const inputUrl = searchParams.get('url');
    const season = searchParams.get('season');
    const episode = searchParams.get('episode');

    if (!inputUrl) {
      return NextResponse.json(
        { success: false, error: 'url parameter is required' },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(inputUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid url parameter' },
        { status: 400 }
      );
    }

    // ── 1. Fetch the detail page ──────────────────────────────────────────────
    const pageRes = await fetch(inputUrl, {
      headers: {
        ...COMMON_HEADERS,
        Cookie: PLAY_COOKIE,
        Referer: 'https://themoviebox.org/',
      },
    });

    if (!pageRes.ok) {
      return NextResponse.json(
        { success: false, error: `Page fetch failed: ${pageRes.status}` },
        { status: pageRes.status }
      );
    }

    const html = await pageRes.text();

    // ── 2. Parse Nuxt data ────────────────────────────────────────────────────
    const meta = parseNuxtData(html);
    if (!meta) {
      return NextResponse.json(
        { success: false, error: 'Could not parse page data' },
        { status: 500 }
      );
    }

    // ── 3. Determine play params ──────────────────────────────────────────────
    const slug = meta.detailPath ?? parsedUrl.pathname.split('/').pop() ?? '';
    const id = meta.subjectId ?? parsedUrl.searchParams.get('id');

    // subjectType 1 = movie (se=0, ep=0); 2 = TV (default se=1, ep=1)
    const isTV = meta.subjectType === 2 || (meta.seasons?.length > 0 && meta.seasons[0].season > 0);
    const finalSeason = season ?? (isTV ? '1' : '0');
    const finalEpisode = episode ?? (isTV ? '1' : '0');

    // ── 4. Call the play API ──────────────────────────────────────────────────
    const playApiUrl = buildPlayApiUrl(String(id), Number(finalSeason), Number(finalEpisode), slug);

    const referer = `https://themoviebox.org/movies/${slug}?id=${id}&type=${parsedUrl.searchParams.get('type') ?? '/movie/detail'}`;

    const playRes = await fetch(playApiUrl, {
      headers: {
        Cookie: PLAY_COOKIE,
        'User-Agent': COMMON_HEADERS['User-Agent'],
        'X-Source': 'h5',
        'X-Client-Info': '{"timezone":"Asia/Calcutta"}',
        'Referer': referer,
        'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Brave";v="144"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Gpc': '1',
      },
    });

    let playData: Record<string, unknown> | null = null;
    if (playRes.ok) {
      playData = await playRes.json() as Record<string, unknown>;
    }

    // ── 5. Return combined result ─────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      meta,
      watchOnline: {
        subjectId: id,
        season: Number(finalSeason),
        episode: Number(finalEpisode),
        playApiUrl,
        ...(playData?.data as Record<string, unknown> | undefined ?? {}),
      },
    });
  } catch (err) {
    console.error('[themovie/det]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
