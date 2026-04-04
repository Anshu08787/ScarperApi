/*
  Extractor for hitsportshd-style pages that embed profamouslife premium player.
  Usage:
    npx tsx scripts/extract-hitsport-stream.ts "https://hitsportshd.xyz/view.php?value=starhindi"
*/

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

import { spawnSync } from 'child_process';

interface FetchResult {
  ok: boolean;
  status: number;
  body: string;
  finalUrl: string;
  error?: string;
}

function decodeBase64(input: string): string {
  return Buffer.from(input, 'base64').toString('utf8');
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchText(
  url: string,
  headers: Record<string, string>,
  timeoutMs = 20000,
  includeBody = true,
  retries = 3
): Promise<FetchResult> {
  let lastResult: FetchResult = {
    ok: false,
    status: 0,
    body: '',
    finalUrl: url,
    error: 'request failed',
  };

  for (let attempt = 1; attempt <= Math.max(1, retries); attempt += 1) {
    const args = [
      '-sS',
      '-L',
      '--http1.1',
      '--compressed',
      '--max-time',
      String(Math.max(1, Math.ceil(timeoutMs / 1000))),
    ];

    Object.entries(headers).forEach(([key, value]) => {
      args.push('-H', `${key}: ${value}`);
    });

    if (!headers['User-Agent']) {
      args.push('-H', `User-Agent: ${USER_AGENT}`);
    }

    if (!includeBody) {
      args.push('-o', '/dev/null');
    }

    args.push('-w', '\n__STATUS__:%{http_code}\n__EFFECTIVE_URL__:%{url_effective}\n', url);

    const result = spawnSync('curl', args, { encoding: 'utf8' });
    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';

    const statusMatch = stdout.match(/__STATUS__:(\d{3})/);
    const finalUrlMatch = stdout.match(/__EFFECTIVE_URL__:(.*)/);

    const status = statusMatch ? Number(statusMatch[1]) : 0;
    const finalUrl = finalUrlMatch ? finalUrlMatch[1].trim() : url;
    const body = includeBody
      ? stdout
          .replace(/\n__STATUS__:\d{3}[\s\S]*$/, '')
          .trim()
      : '';

    const current: FetchResult = {
      ok: status >= 200 && status < 300,
      status,
      body,
      finalUrl,
      error: result.status === 0 ? undefined : stderr.trim() || 'curl failed',
    };

    if (current.ok) {
      return current;
    }

    lastResult = current;
  }

  return lastResult;
}

function normalizeUrl(raw: string, base: string): string {
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return new URL(raw, base).toString();
  return raw;
}

function extractScriptUrls(html: string, pageUrl: string): string[] {
  const regex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const out = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html))) {
    out.add(normalizeUrl(match[1], pageUrl));
  }

  return Array.from(out);
}

function parseArrayLiteralChars(arrayLiteral: string): string {
  const tokenRegex = /(['"])((?:\\.|(?!\1)[\s\S])*)\1/g;
  const chars: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(arrayLiteral))) {
    const token = match[2]
      .replace(/\\\//g, '/')
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    chars.push(token);
  }

  return chars.join('');
}

function extractFid(html: string): string | null {
  const fidMatch = html.match(/\bfid\s*=\s*["']([^"']+)["']/i);
  return fidMatch ? fidMatch[1].trim() : null;
}

function extractPremiumPhpBase(premiumJs: string): string | null {
  const match = premiumJs.match(/https?:\/\/[^"']+\/premium\.php\?player=/i);
  return match ? match[0] : null;
}

function extractStreamUrlFromPremiumHtml(premiumHtml: string): {
  streamUrl: string | null;
  debug: Record<string, string | null>;
} {
  const returnArrayMatch = premiumHtml.match(
    /function\s+getStreamUrl\s*\(\)\s*\{[\s\S]*?return\s*\(\s*(\[[\s\S]*?\])\s*\.join\(\s*["']{2}\s*\)/i
  );

  const baseFromArray = returnArrayMatch ? parseArrayLiteralChars(returnArrayMatch[1]) : null;

  const variableSuffixNameMatch = premiumHtml.match(
    /\+\s*([A-Za-z_$][\w$]*)\.join\(\s*["']{2}\s*\)\s*\+\s*document\.getElementById\(/i
  );
  const suffixVarName = variableSuffixNameMatch ? variableSuffixNameMatch[1] : null;

  let suffixFromVar = '';
  if (suffixVarName) {
    const varMatch = premiumHtml.match(
      new RegExp(`(?:var|let|const)\\s+${escapeRegex(suffixVarName)}\\s*=\\s*(\\[[\\s\\S]*?\\]);`, 'i')
    );
    if (varMatch) {
      suffixFromVar = parseArrayLiteralChars(varMatch[1]);
    }
  }

  const spanIdMatch = premiumHtml.match(/document\.getElementById\(\s*["']([^"']+)["']\s*\)\.innerHTML/i);
  const spanId = spanIdMatch ? spanIdMatch[1] : null;

  let suffixFromSpan = '';
  if (spanId) {
    const spanRegex = new RegExp(
      `<span[^>]*\\bid\\s*=\\s*(?:"${escapeRegex(spanId)}"|'${escapeRegex(spanId)}'|${escapeRegex(spanId)})[^>]*>([\\s\\S]*?)<\\/span>`,
      'i'
    );
    const spanMatch = premiumHtml.match(spanRegex);
    suffixFromSpan = spanMatch ? (spanMatch[1] ?? '').trim() : '';
  }

  const atobHintMatch = premiumHtml.match(/atob\(\s*["']([^"']+)["']\s*\)/i);
  const atobHint = atobHintMatch ? decodeBase64(atobHintMatch[1]) : null;

  const streamUrl = baseFromArray ? `${baseFromArray}${suffixFromVar}${suffixFromSpan}` : null;

  return {
    streamUrl,
    debug: {
      baseFromArray,
      suffixVarName,
      suffixFromVar: suffixFromVar || null,
      spanId,
      suffixFromSpan: suffixFromSpan || null,
      atobHint,
    },
  };
}

function extractFirstSegmentUrl(playlistBody: string, playlistUrl: string): string | null {
  const lines = playlistBody.split('\n').map((line) => line.trim());
  const segment = lines.find((line) => line && !line.startsWith('#'));
  if (!segment) return null;

  try {
    return new URL(segment, playlistUrl).toString();
  } catch {
    return null;
  }
}

async function main() {
  const target = process.argv[2] ?? 'https://hitsportshd.xyz/view.php?value=starhindi';
  const targetUrl = new URL(target);

  const page = await fetchText(
    target,
    {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    20000
  );

  if (!page.ok) {
    console.error(
      JSON.stringify(
        {
          success: false,
          step: 'fetch-page',
          target,
          status: page.status,
          error: page.error ?? 'page fetch failed',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const fid = extractFid(page.body) ?? targetUrl.searchParams.get('value') ?? '';
  const scripts = extractScriptUrls(page.body, page.finalUrl);
  const premiumScriptCandidate =
    scripts.find((url) => /profamouslife\.com\/premium\.js/i.test(url)) ?? 'https://profamouslife.com/premium.js';

  const premiumFetchCandidates = Array.from(
    new Set([
      premiumScriptCandidate,
      premiumScriptCandidate.replace(/^https:\/\//i, 'http://'),
      'http://profamouslife.com/premium.js',
      'https://profamouslife.com/premium.js',
    ])
  );

  let premiumJs: FetchResult | null = null;
  let premiumJsUrl = '';

  for (const candidate of premiumFetchCandidates) {
    const attempt = await fetchText(
      candidate,
      {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
        Referer: target,
      },
      20000
    );

    if (attempt.ok && attempt.body.length > 0) {
      premiumJs = attempt;
      premiumJsUrl = candidate;
      break;
    }
  }

  if (!premiumJs) {
    console.error(
      JSON.stringify(
        {
          success: false,
          step: 'fetch-premium-js',
          target,
          premiumFetchCandidates,
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const premiumPhpBase = extractPremiumPhpBase(premiumJs.body) ?? 'https://profamouslife.com/premium.php?player=';
  const liveValue = fid || targetUrl.searchParams.get('value') || 'starhindi';

  const mobilePlayerUrl = `${premiumPhpBase}mobile&live=${encodeURIComponent(liveValue)}`;

  const premiumMobileCandidates = Array.from(
    new Set([mobilePlayerUrl, mobilePlayerUrl.replace(/^https:\/\//i, 'http://')])
  );

  const premiumMobileHeaderVariants: Array<Record<string, string>> = [
    {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Referer: target,
    },
    {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      Referer: `${new URL(premiumPhpBase).origin}/`,
    },
  ];

  let premiumMobile: FetchResult | null = null;
  for (const candidate of premiumMobileCandidates) {
    for (const headers of premiumMobileHeaderVariants) {
      const attempt = await fetchText(candidate, headers, 25000);
      if (attempt.ok && attempt.body.length > 0) {
        premiumMobile = attempt;
        break;
      }
    }
    if (premiumMobile) break;
  }

  if (!premiumMobile) {
    premiumMobile = {
      ok: false,
      status: 0,
      body: '',
      finalUrl: mobilePlayerUrl,
      error: 'all premium mobile fetch attempts failed',
    };
  }

  if (!premiumMobile.ok) {
    console.error(
      JSON.stringify(
        {
          success: false,
          step: 'fetch-premium-mobile',
          target,
          mobilePlayerUrl,
          status: premiumMobile.status,
          error: premiumMobile.error ?? 'premium mobile fetch failed',
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const streamData = extractStreamUrlFromPremiumHtml(premiumMobile.body);
  const streamUrl = streamData.streamUrl;

  if (!streamUrl) {
    console.error(
      JSON.stringify(
        {
          success: false,
          step: 'extract-stream-url',
          target,
          mobilePlayerUrl,
          debug: streamData.debug,
        },
        null,
        2
      )
    );
    process.exit(1);
  }

  const premiumOrigin = new URL(premiumMobile.finalUrl || mobilePlayerUrl).origin;

  const playlistNoRef = await fetchText(
    streamUrl,
    {
      'User-Agent': USER_AGENT,
      Accept: '*/*',
    },
    20000
  );

  const playlistWithRef = await fetchText(
    streamUrl,
    {
      'User-Agent': USER_AGENT,
      Accept: '*/*',
      Referer: `${premiumOrigin}/`,
      Origin: premiumOrigin,
    },
    20000
  );

  const firstSegmentUrl =
    playlistWithRef.ok && playlistWithRef.body.includes('#EXTM3U')
      ? extractFirstSegmentUrl(playlistWithRef.body, streamUrl)
      : null;

  let segmentNoRefStatus: number | null = null;
  let segmentWithRefStatus: number | null = null;

  if (firstSegmentUrl) {
    const segNoRef = await fetchText(
      firstSegmentUrl,
      {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
      },
      20000,
      false
    );
    segmentNoRefStatus = segNoRef.status;

    const segWithRef = await fetchText(
      firstSegmentUrl,
      {
        'User-Agent': USER_AGENT,
        Accept: '*/*',
        Referer: `${premiumOrigin}/`,
        Origin: premiumOrigin,
      },
      20000,
      false
    );
    segmentWithRefStatus = segWithRef.status;
  }

  const expires = new URL(streamUrl).searchParams.get('expires');
  const expiresUtc = expires ? new Date(Number(expires) * 1000).toISOString() : null;

  console.log(
    JSON.stringify(
      {
        success: true,
        target,
        fid: liveValue,
        scriptsFound: scripts.length,
        premiumJsUrl,
        mobilePlayerUrl,
        streamUrl,
        token: {
          expires,
          expiresUtc,
        },
        accessCheck: {
          playlistNoRefererStatus: playlistNoRef.status,
          playlistWithRefererStatus: playlistWithRef.status,
          firstSegmentUrl,
          firstSegmentNoRefererStatus: segmentNoRefStatus,
          firstSegmentWithRefererStatus: segmentWithRefStatus,
        },
        debug: streamData.debug,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )
  );
  process.exit(1);
});
