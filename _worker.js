export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    
    if (url.pathname.startsWith('/')) {
      // 1. 替换为你的 R2 存储桶公共域名
      url.hostname = 'pub-eb56c075642a4c229a1ca8eb4b4ecb31.r2.dev';
      
      // 2. 深度克隆请求头，并删掉 host，防止内部环路报错
      let newHeaders = new Headers(request.headers);
      newHeaders.delete("host");
      
      // 3. 这里的 fetch 只负责去 R2 发起连接，不直接下载整个文件到内存
      let response = await fetch(url, {
        method: request.method,
        headers: newHeaders,
        redirect: "follow"
      });

      // 4. 【核心改动：流式返回】
      // 提取 response.body（它是一个 ReadableStream 数据流）直接返回。
      // 这样 Cloudflare 就会像自来水管一样，从 R2 读多少，就立刻传给用户多少，
      // 内存里永远只占几 KB，彻底绕过 128MB 的内存限制。
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
    }
    
    return env.ASSETS.fetch(request);
  },
};
