export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      // 1. 填入你正确的纯域名（去掉了 https:// 和路径）
      url.hostname = 'pub-eb56c075642a4c229a1ca8eb4b4ecb31.r2.dev';
      
      let new_request = new Request(url, request);
      
      // 2. 核心关键：必须删除 host 头！防止触发 Cloudflare 1000 环路死锁
      new_request.headers.delete("host");
      
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
