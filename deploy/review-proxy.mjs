export default {
  async fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'wisdom-review.2.25.136.64.sslip.io';
    url.protocol = 'https:';
    url.port = '';
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('x-forwarded-host', new URL(request.url).host);
    headers.set('x-forwarded-proto', 'https');
    headers.set('x-forwarded-for', request.headers.get('cf-connecting-ip') || 'unknown');
    return fetch(new Request(url, {method:request.method, headers, body:request.body, redirect:'manual'}));
  },
};
