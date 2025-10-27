let _nodeFetch;
const IPINFO_TOKEN = process.env.IPINFO_TOKEN || '7d863e1849ce97';

export function getClientIp(req) {
  // Prefer X-Forwarded-For when behind proxies/load balancers
  const xf = req.headers && (req.headers['x-forwarded-for'] || req.headers['X-Forwarded-For']);
  let ip = null;
  if (xf) ip = String(xf).split(',')[0].trim();
  // Express may set req.ip (could be like ::ffff:127.0.0.1)
  if (!ip && req.ip) ip = req.ip;
  // Fallbacks
  if (!ip && req.connection && req.connection.remoteAddress) ip = req.connection.remoteAddress;
  if (!ip && req.socket && req.socket.remoteAddress) ip = req.socket.remoteAddress;
  if (!ip) return null;

  // Normalize IPv6 mapped IPv4 addresses like ::ffff:127.0.0.1 -> 127.0.0.1
  if (ip.startsWith('::ffff:')) ip = ip.replace('::ffff:', '');
  if (ip === '::1') ip = '127.0.0.1';

  return ip;
}

function isPrivateIp(ip) {
  // Simple checks for common private/local IP ranges
  if (!ip) return false;
  // IPv4
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip)) return true;
  // IPv6 local
  if (ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd')) return true;
  return false;
}

export async function fetchIpInfo(ip) {
  if (!ip) return null;

  // If IP looks local/private, skip external lookup (won't produce useful geo data)
  if (isPrivateIp(ip)) {
    return { ip, local: true };
  }

  try {
    // Prefer global fetch if available (Node 18+). Fall back to node-fetch dynamic import.
    const fetchFn = (typeof fetch !== 'undefined') ? fetch : (async () => {
      if (!_nodeFetch) {
        _nodeFetch = (await import('node-fetch')).default;
      }
      return _nodeFetch;
    })();

    const realFetch = (typeof fetch !== 'undefined') ? fetch : await fetchFn;

    const url = `https://ipinfo.io/${encodeURIComponent(ip)}?token=${encodeURIComponent(IPINFO_TOKEN)}`;
    const res = await realFetch(url, { timeout: 5000 });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn(`ipinfo response not ok: ${res.status} ${res.statusText} - ${txt}`);
      return null;
    }
    const data = await res.json();
    // normalize fields
    return {
      ip: data.ip || ip,
      city: data.city || null,
      region: data.region || null,
      country: data.country || null,
      loc: data.loc || null,
      org: data.org || null,
      hostname: data.hostname || null
    };
  } catch (err) {
    // non-fatal
    console.error('ipinfo fetch failed', err && err.message ? err.message : err);
    return null;
  }
}
