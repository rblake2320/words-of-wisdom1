export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'words-of-wisdom-4t7.pages.dev';
    return Response.redirect(url, 308);
  },
};
