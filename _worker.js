export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 处理 favicon
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // 2. 只允许 GET 和 HEAD 请求
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // 3. 预设允许访问的前缀白名单
    const allowedPrefixes = [
      '/setu_pic',
      '/setu',
      '/zrsetu_pic',
      '/zrsetu',
      '/acg_pic',
      '/ping.txt',
    ];

    // 4. 拦截显式禁止的 zip 路径
    const isZipPath = url.pathname.startsWith('/setu_zip') || url.pathname.startsWith('/zrsetu_zip');

    // 5. 校验白名单
    const isAllowed = allowedPrefixes.some(prefix => url.pathname.startsWith(prefix)) && !isZipPath;

    if (!isAllowed) {
      return new Response('Access Denied: This path is not allowed via this route.', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // 6. 提取 R2 文件 Key
    const key = decodeURIComponent(url.pathname.slice(1));

    try {
      // 7. 【关键修正】直接将原始 Request 对象或 Range 传递给 R2 API
      const range = request.headers.get('range');
      const object = await env.MY_BUCKET.get(key, {
        range: range ? request.headers : undefined,
        onlyIf: request.headers,
      });

      if (!object) {
        return new Response('404 Not Found', { status: 404 });
      }

      // 8. 构建标准的视频流响应头
      const headers = new Headers();
      
      // 写入 R2 绑定的 Content-Type, Content-Language 等元数据
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);

      // 显式允许 Range 拖拽
      headers.set('accept-ranges', 'bytes');

      // 禁用缓存
      headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');

      // 允许跨域（视频跨域必须）
      headers.set('access-control-allow-origin', '*');

      // 【关键修正】写入 Range 具体的返回范围信息
      if (object.range) {
        headers.set('content-range', `bytes ${object.range.offset}-${object.range.offset + object.size - 1}/${object.size}`);
      }

      // 确定状态码：只有 R2 真正返回了 range 切片时才给 206
      const status = object.body ? (range ? 206 : 200) : 304;

      return new Response(object.body, {
        status,
        headers,
      });

    } catch (err) {
      return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
  },
};
