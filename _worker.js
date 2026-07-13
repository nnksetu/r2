export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      url.hostname = 'https://pub-eb56c075642a4c229a1ca8eb4b4ecb31.r2.dev'//替换为你的存储桶给出的域名
      let new_request = new Request(url, request);
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
