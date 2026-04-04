import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const FALLBACK_BACKEND_BASE = 'https://mznxiwqjdiq00239q.space';
const FORCED_PROXY_BASE = 'https://xprime.hunternisha55.workers.dev';
const DEFAULT_TMDB_API_KEY = process.env.TMDB_API_KEY || '439c478a771f35c05022f9feabcca01c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type MediaType = 'movie' | 'tv';

interface WatchInfo {
  watchUrl: string;
  tmdbId: number;
  season?: number;
  episode?: number;
  mediaTypeHint: MediaType;
}

interface TmdbDetails {
  mediaType: MediaType;
  id: number;
  title: string;
  year?: number;
  imdbId?: string;
}

interface ServerRow {
  name: string;
  status?: string;
  language?: string;
}

interface ServerProbeResult {
  name: string;
  status: number;
  ok: boolean;
  requestUrl: string;
  requiresVerification: boolean;
  error?: string;
  streams: string[];
}

interface AltchaChallenge {
  algorithm: string;
  challenge: string;
  maxnumber: number;
  salt: string;
  signature: string;
}

interface AltchaSolveResult {
  ok: boolean;
  token?: string;
  error?: string;
  tookMs?: number;
  foundNumber?: number;
}

function toPositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

function parseWatchUrl(input: string): WatchInfo {
  const url = new URL(input);
  const segments = url.pathname.split('/').filter(Boolean);
  const watchIdx = segments.indexOf('watch');

  if (watchIdx === -1 || !segments[watchIdx + 1]) {
    throw new Error('Invalid watch URL: expected /watch/<id>');
  }

  const tmdbId = Number(segments[watchIdx + 1]);
  if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
    throw new Error('Invalid watch URL: id must be numeric');
  }

  const season = toPositiveInt(segments[watchIdx + 2] ?? null);
  const episode = toPositiveInt(segments[watchIdx + 3] ?? null);
  const mediaTypeHint: MediaType = season && episode ? 'tv' : 'movie';

  return {
    watchUrl: url.toString(),
    tmdbId,
    season,
    episode,
    mediaTypeHint,
  };
}

function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

function maxnumberToTargetHex(maxnumber: number): string {
  const max256 = (BigInt(1) << BigInt(256)) - BigInt(1);
  return (max256 / BigInt(maxnumber + 1)).toString(16).padStart(64, '0');
}

function solveAltchaPow(challenge: AltchaChallenge): { number: number; tookMs: number } {
  const target = maxnumberToTargetHex(challenge.maxnumber);
  const startedAt = Date.now();
  const maxIterations = Math.min(challenge.maxnumber * 10, 2_000_000);

  for (let n = 0; n <= maxIterations; n += 1) {
    const hash = sha256Hex(`${challenge.algorithm}:${challenge.challenge}:${challenge.salt}:${n}`);
    if (hash <= target) {
      return { number: n, tookMs: Date.now() - startedAt };
    }
  }

  throw new Error('No PoW solution found within iteration limit');
}

async function generateAltchaToken(backendBase: string): Promise<AltchaSolveResult> {
  try {
    const response = await fetch(`${backendBase}/altcha/challenge`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json,text/plain,*/*',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        error: `Challenge endpoint failed: ${response.status}`,
      };
    }

    const challenge = (await response.json()) as AltchaChallenge;
    if (!challenge || !challenge.challenge || !challenge.salt || !challenge.signature) {
      return {
        ok: false,
        error: 'Invalid challenge payload',
      };
    }

    const solved = solveAltchaPow(challenge);
    const tokenPayload = {
      algorithm: challenge.algorithm,
      challenge: challenge.challenge,
      maxnumber: challenge.maxnumber,
      number: solved.number,
      salt: challenge.salt,
      signature: challenge.signature,
      took: solved.tookMs,
    };

    return {
      ok: true,
      token: Buffer.from(JSON.stringify(tokenPayload)).toString('base64'),
      tookMs: solved.tookMs,
      foundNumber: solved.number,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to generate altcha token',
    };
  }
}

async function fetchText(url: string, accept = '*/*'): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: accept,
    },
    cache: 'no-store',
    redirect: 'follow',
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
}

function extractAppEntryUrl(html: string, pageUrl: string): string | null {
  const match = html.match(/(?:import\(|src=["'])([^"']*_app\/immutable\/entry\/app\.[^"']+\.js)/i);
  if (!match?.[1]) return null;

  const raw = match[1].trim();
  const page = new URL(pageUrl);

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (raw.startsWith('../') || raw.startsWith('./') || raw.startsWith('/')) {
    return new URL(raw, pageUrl).toString();
  }

  if (raw.startsWith('_app/')) {
    return new URL(`/${raw}`, page.origin).toString();
  }

  return new URL(raw, pageUrl).toString();
}

function extractChunkPaths(appBundle: string): string[] {
  const found = appBundle.match(/\.\.\/chunks\/[A-Za-z0-9_-]+\.js/g) ?? [];
  const unique = new Set<string>();

  for (const item of found) {
    unique.add(item.replace('../', '/_app/immutable/'));
  }

  return Array.from(unique);
}

function discoverBackendBase(chunkText: string): string | null {
  if (!chunkText.includes('SERVERS:"/servers"')) {
    return null;
  }

  const match = chunkText.match(/https?:\/\/[^"']+/);
  return match ? match[0] : null;
}

async function discoverXprimeBackend(watchUrl: string): Promise<{
  backendBase: string;
  appEntryUrl: string | null;
  analyzedChunk: string | null;
}> {
  const page = await fetchText(watchUrl, 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
  if (!page.ok) {
    return {
      backendBase: FALLBACK_BACKEND_BASE,
      appEntryUrl: null,
      analyzedChunk: null,
    };
  }

  const appEntryUrl = extractAppEntryUrl(page.body, watchUrl);
  if (!appEntryUrl) {
    return {
      backendBase: FALLBACK_BACKEND_BASE,
      appEntryUrl: null,
      analyzedChunk: null,
    };
  }

  const appEntry = await fetchText(appEntryUrl);
  if (!appEntry.ok || !appEntry.body) {
    return {
      backendBase: FALLBACK_BACKEND_BASE,
      appEntryUrl,
      analyzedChunk: null,
    };
  }

  const chunkPaths = extractChunkPaths(appEntry.body).slice(0, 30);
  const origin = new URL(watchUrl).origin;

  for (const chunkPath of chunkPaths) {
    const chunkUrl = new URL(chunkPath, origin).toString();
    const chunk = await fetchText(chunkUrl);
    if (!chunk.ok || !chunk.body) {
      continue;
    }

    const backend = discoverBackendBase(chunk.body);
    if (backend) {
      return {
        backendBase: backend,
        appEntryUrl,
        analyzedChunk: chunkUrl,
      };
    }
  }

  return {
    backendBase: FALLBACK_BACKEND_BASE,
    appEntryUrl,
    analyzedChunk: null,
  };
}

async function fetchTmdbDetails(tmdbId: number, mediaTypeHint: MediaType): Promise<TmdbDetails | null> {
  if (!DEFAULT_TMDB_API_KEY) {
    return null;
  }

  const tryTypes: MediaType[] = mediaTypeHint === 'tv' ? ['tv', 'movie'] : ['movie', 'tv'];

  for (const mediaType of tryTypes) {
    const url = `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${DEFAULT_TMDB_API_KEY}&append_to_response=external_ids`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) continue;

    const data = (await response.json()) as {
      title?: string;
      name?: string;
      release_date?: string;
      first_air_date?: string;
      external_ids?: { imdb_id?: string };
    };

    const title = (data.title || data.name || '').trim();
    if (!title) continue;

    const date = data.release_date || data.first_air_date;
    const year = date ? Number(date.slice(0, 4)) : undefined;

    return {
      mediaType,
      id: tmdbId,
      title,
      year: Number.isFinite(year) ? year : undefined,
      imdbId: data.external_ids?.imdb_id,
    };
  }

  return null;
}

async function fetchServerList(backendBase: string): Promise<ServerRow[]> {
  const result = await fetchText(`${backendBase}/servers`, 'application/json,text/plain,*/*');
  if (!result.ok) return [];

  try {
    const parsed = JSON.parse(result.body) as { servers?: ServerRow[] };
    return Array.isArray(parsed.servers) ? parsed.servers : [];
  } catch {
    return [];
  }
}

function maybeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function decodeMaybeBase64(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed || trimmed.length % 4 !== 0) return null;
  if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) return null;

  try {
    return Buffer.from(trimmed, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

function parseServerPayload(rawText: string): unknown {
  const direct = maybeJsonParse(rawText);
  if (direct !== null) return direct;

  const unescaped = rawText.replace(/\\\//g, '/');
  const unescapedParsed = maybeJsonParse(unescaped);
  if (unescapedParsed !== null) return unescapedParsed;

  const decoded = decodeMaybeBase64(rawText);
  if (decoded) {
    const decodedParsed = maybeJsonParse(decoded);
    if (decodedParsed !== null) return decodedParsed;
  }

  return { raw: rawText };
}

function isLikelyStreamUrl(url: string): boolean {
  if (!/^https?:\/\//i.test(url)) return false;

  const lower = url.toLowerCase();
  if (/\.(vtt|srt|ass|ssa|sub)(\?|$)/i.test(lower)) return false;
  if (/\.(jpg|jpeg|png|gif|webp|svg|css|js|woff2?|ttf|ico)(\?|$)/i.test(lower)) return false;

  return true;
}

function normalizeStreamUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hasProxyPayload = parsed.searchParams.has('v');
    if (hasProxyPayload) {
      const forced = new URL(FORCED_PROXY_BASE);
      const rewritten = new URL(forced.toString());

      // Keep payload/query data from the source proxy link, only swap domain.
      rewritten.pathname = parsed.pathname || '/';
      rewritten.search = parsed.search;

      return rewritten.toString();
    }
    return url;
  } catch {
    return url;
  }
}

function extractUrlsDeep(value: unknown, out: Set<string>) {
  if (!value) return;

  if (typeof value === 'string') {
    const normalized = value
      .trim()
      .replace(/\\\//g, '/')
      .replace(/\\u0026/g, '&');

    if (/^https?:\/\//i.test(normalized)) {
      out.add(normalized);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) extractUrlsDeep(item, out);
    return;
  }

  if (typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      extractUrlsDeep(nested, out);
    }
  }
}

function getPayloadError(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== 'object') return undefined;
  const obj = parsed as Record<string, unknown>;

  const error =
    (typeof obj.error === 'string' && obj.error) ||
    (typeof obj.message === 'string' && obj.message) ||
    (typeof obj.status === 'string' && obj.status === 'error' ? 'status:error' : undefined);

  return error || undefined;
}

function buildServerRequestUrl(
  backendBase: string,
  serverName: string,
  tmdb: TmdbDetails,
  watch: WatchInfo,
  token: string | null
): string {
  const params = new URLSearchParams();

  if (tmdb.title) params.set('name', tmdb.title);
  if (tmdb.year) params.set('year', String(tmdb.year));
  params.set('id', String(watch.tmdbId));
  if (tmdb.imdbId) params.set('imdb', tmdb.imdbId);
  if (watch.season) params.set('season', String(watch.season));
  if (watch.episode) params.set('episode', String(watch.episode));
  if (token) params.set('altcha', token);

  return `${backendBase}/${serverName}?${params.toString()}`;
}

function looksLikeVerificationBlock(status: number, rawText: string, parsed: unknown): boolean {
  if (status === 403) return true;

  const blob = [rawText, JSON.stringify(parsed)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return blob.includes('verification token') || blob.includes('turnstile');
}

async function probeServer(
  backendBase: string,
  serverName: string,
  tmdb: TmdbDetails,
  watch: WatchInfo,
  token: string | null
): Promise<ServerProbeResult> {
  const requestUrl = buildServerRequestUrl(backendBase, serverName, tmdb, watch, token);
  const response = await fetchText(requestUrl, 'application/json,text/plain,*/*');
  const parsed = parseServerPayload(response.body);

  const urlSet = new Set<string>();
  extractUrlsDeep(parsed, urlSet);

  const streamCandidates = Array.from(
    new Set(
      Array.from(urlSet)
        .filter((url) => isLikelyStreamUrl(url))
        .map((url) => normalizeStreamUrl(url))
    )
  );

  const payloadError = getPayloadError(parsed);
  const requiresVerification = looksLikeVerificationBlock(response.status, response.body, parsed);

  return {
    name: serverName,
    status: response.status,
    ok: response.ok && streamCandidates.length > 0,
    requestUrl,
    requiresVerification,
    error: payloadError,
    streams: streamCandidates,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const idParam = searchParams.get('id');
  const seasonParam = searchParams.get('s');
  const episodeParam = searchParams.get('e');
  const inputToken = searchParams.get('token') || searchParams.get('altcha');

  let watchInfo: WatchInfo;
  try {
    const tmdbId = toPositiveInt(idParam);
    if (!tmdbId) {
      throw new Error('Invalid or missing id query parameter');
    }

    const season = toPositiveInt(seasonParam);
    const episode = toPositiveInt(episodeParam);

    if ((season && !episode) || (!season && episode)) {
      throw new Error('Both s (season) and e (episode) are required for series requests');
    }

    const watchUrl =
      season && episode
        ? `https://xprime.su/watch/${tmdbId}/${season}/${episode}`
        : `https://xprime.su/watch/${tmdbId}`;

    watchInfo = parseWatchUrl(watchUrl);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid request parameters',
      },
      { status: 400 }
    );
  }

  try {
    const backendDiscovery = await discoverXprimeBackend(watchInfo.watchUrl);
    const tmdb = await fetchTmdbDetails(watchInfo.tmdbId, watchInfo.mediaTypeHint);

    if (!tmdb) {
      return NextResponse.json(
        {
          success: false,
          error: 'Could not resolve TMDB metadata for this watch id',
          watch: watchInfo,
          backend: backendDiscovery,
        },
        { status: 422 }
      );
    }

    const servers = await fetchServerList(backendDiscovery.backendBase);
    const activeServers = servers.filter((s) => (s.status || 'ok').toLowerCase() === 'ok');

    const probeTargets = (activeServers.length ? activeServers : [{ name: 'primenet' }]).map((s) => s.name);

    const probeResults: ServerProbeResult[] = [];
    const verificationServers = new Set<string>();

    for (const serverName of probeTargets) {
      try {
        const result = await probeServer(backendDiscovery.backendBase, serverName, tmdb, watchInfo, inputToken);
        probeResults.push(result);

        if (result.requiresVerification && !inputToken) {
          verificationServers.add(serverName);
        }
      } catch (error) {
        probeResults.push({
          name: serverName,
          status: 0,
          ok: false,
          requestUrl: buildServerRequestUrl(backendDiscovery.backendBase, serverName, tmdb, watchInfo, inputToken),
          requiresVerification: false,
          error: error instanceof Error ? error.message : 'Probe failed',
          streams: [],
        });
      }
    }

    let autoTokenResult: AltchaSolveResult | null = null;
    if (!inputToken && verificationServers.size > 0) {
      autoTokenResult = await generateAltchaToken(backendDiscovery.backendBase);

      if (autoTokenResult.ok && autoTokenResult.token) {
        for (const serverName of verificationServers) {
          try {
            const retried = await probeServer(
              backendDiscovery.backendBase,
              serverName,
              tmdb,
              watchInfo,
              autoTokenResult.token
            );

            const idx = probeResults.findIndex((item) => item.name === serverName);
            if (idx >= 0) {
              probeResults[idx] = retried;
            } else {
              probeResults.push(retried);
            }
          } catch {
            // Keep original probe result if retry fails.
          }
        }
      }
    }

    const allStreamsSet = new Set<string>();
    for (const row of probeResults) {
      for (const stream of row.streams) {
        allStreamsSet.add(stream);
      }
    }

    const allStreams = Array.from(allStreamsSet);
    const serversWithStreams = probeResults.filter((p) => p.streams.length > 0);

    return NextResponse.json({
      success: allStreams.length > 0,
      watch: watchInfo,
      backend: backendDiscovery,
      serversTried: probeResults.length,
      streamsFound: allStreams.length,
      streams: allStreams,
      serverResults: serversWithStreams,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to extract XPrime streams',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
