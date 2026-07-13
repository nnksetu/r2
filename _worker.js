export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      
      // 1. 这里必须是纯域名，不能带 https://，不能带后缀路径！
      // 2. 必须是 R2 桶的公共域名 (xxx.r2.dev)，不能是 cloudflarestorage.com
      url.hostname = '1717131a88149718861403ea3ada74de.r2.dev'; 
      
      let new_request = new Request(url, request);
      
      // 关键：必须把客户端带过来的 host 头删掉，让 R2 以为是直接访问 xxx.r2.dev
      new_request.headers.delete("host");
      
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
