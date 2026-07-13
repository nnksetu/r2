export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      

      url.hostname = 'pub-eb56c075642a4c229a1ca8eb4b4ecb31.r2.dev'; 
      
      let new_request = new Request(url, request);
      
      // 关键：必须把客户端带过来的 host 头删掉，让 R2 以为是直接访问 xxx.r2.dev
      new_request.headers.delete("host");
      
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
