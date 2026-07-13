export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    
    if (url.pathname.startsWith('/')) {
      // 1. 修改目标域名为你的 R2 域名
      url.hostname = 'https://1717131a88149718861403ea3ada74de.r2.cloudflarestorage.com/setutime'; // 记得替换成你自己的
      
      // 2. 深度克隆请求头，防止直接修改原始 request 报错
      let newHeaders = new Headers(request.headers);
      
      // 3. 关键：移除可能导致 R2 鉴权或跨域失败的 Host 和 Origin
      newHeaders.delete("host");
      newHeaders.delete("origin");
      newHeaders.delete("referer"); 

      // 4. 构建全新的请求对象，完整传递 method 和 body
      let newRequest = new Request(url, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        redirect: "follow"
      });
      
      // 5. 请求 R2 桶
      let response = await fetch(newRequest);

      // 6. 保持流式返回（response.body 本身就是个可读流）
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    
    return env.ASSETS.fetch(request);
  },
};
