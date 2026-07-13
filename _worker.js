export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      url.hostname = 'https://1717131a88149718861403ea3ada74de.r2.cloudflarestorage.com/setutime'; // 替换为你的R2域名
      
      // 发起请求
      let response = await fetch(url, {
        method: request.method,
        headers: request.headers
      });

      // 使用流式传输返回，这样就不会把整个大文件一次性吃进 Worker 的内存里
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    return env.ASSETS.fetch(request);
  },
};
