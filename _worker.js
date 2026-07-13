export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      url.hostname = 'https://1717131a88149718861403ea3ada74de.r2.cloudflarestorage.com/setutime'//替换为你的存储桶给出的域名
      let new_request = new Request(url, request);
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
