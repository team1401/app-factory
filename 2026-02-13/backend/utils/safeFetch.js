const dns = require('dns');
const net = require('net');
const http = require('http');
const https = require('https');
const axios = require('axios');

const MAX_REDIRECTS = 3;
const MAX_CONTENT_LENGTH = 2 * 1024 * 1024;
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

// Separate lists: Node's BlockList matches IPv4 addresses against IPv4-mapped IPv6 rules.
const ipv4BlockList = new net.BlockList();
const ipv6BlockList = new net.BlockList();
[
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4]
].forEach(([addr, prefix]) => ipv4BlockList.addSubnet(addr, prefix, 'ipv4'));
[
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['64:ff9b::', 96],
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['2001::', 32],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['fec0::', 10],
  ['ff00::', 8]
].forEach(([addr, prefix]) => ipv6BlockList.addSubnet(addr, prefix, 'ipv6'));

class UnsafeUrlError extends Error {}

function isBlockedAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return ipv4BlockList.check(address, 'ipv4');
  if (family === 6) return ipv6BlockList.check(address, 'ipv6');
  return true;
}

// Validates every address at connect time, so DNS rebinding cannot swap in an internal IP.
function safeLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
      return callback(new UnsafeUrlError('Destination address is not allowed'));
    }
    if (options.all) return callback(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
}

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

function parseAllowedUrl(rawUrl, base) {
  let parsed;
  try {
    parsed = new URL(rawUrl, base);
  } catch {
    throw new UnsafeUrlError('Invalid URL');
  }
  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new UnsafeUrlError('Only http and https URLs are allowed');
  }
  if (parsed.username || parsed.password) {
    throw new UnsafeUrlError('URLs with credentials are not allowed');
  }
  // Node's net.connect skips the lookup hook for IP literals, so check them here.
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isBlockedAddress(host)) {
    throw new UnsafeUrlError('Destination address is not allowed');
  }
  return parsed;
}

async function safeGet(rawUrl, { timeout = 10000, headers = {} } = {}) {
  let current = parseAllowedUrl(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await axios.get(current.toString(), {
      timeout,
      headers,
      httpAgent,
      httpsAgent,
      proxy: false,
      maxRedirects: 0,
      maxContentLength: MAX_CONTENT_LENGTH,
      responseType: 'text',
      transformResponse: [(data) => data],
      validateStatus: (status) => status >= 200 && status < 400
    });

    if (response.status < 300) return response;

    const location = response.headers.location;
    if (!location) throw new Error('Redirect without location');
    current = parseAllowedUrl(location, current);
  }

  throw new Error('Too many redirects');
}

module.exports = { safeGet, parseAllowedUrl, isBlockedAddress, UnsafeUrlError };
