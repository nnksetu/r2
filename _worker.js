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

    // 4. 拦截显式禁止的 zip 路径（双重保险）
    const isZipPath = url.pathname.startsWith('/setu_zip') || url.pathname.startsWith('/zrsetu_zip');

    // 5. 检查是否符合允许条件：必须在前缀白名单中，且不能是 zip 路径
    const isAllowed = allowedPrefixes.some(prefix => url.pathname.startsWith(prefix)) && !isZipPath;

    // 如果不在白名单内，直接拦截
    if (!isAllowed) {
      return new Response('Access Denied: This path is not allowed via this route.', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // --- R2 原生内网读取逻辑 ---

    // 6. 提取 R2 中的文件路径 Key（去掉开头的斜杠并解码）
    const key = decodeURIComponent(url.pathname.slice(1));

    try {
      // 7. 处理 Range 请求头（支持视频/音频拖拽分段加载）
      const options = {};
      const rangeHeader = request.headers.get('range');
      if (rangeHeader) {
        options.range = request.headers;
      }

      // 8. 通过原生绑定直接从 R2 获取文件（走内网）
      const object = await env.MY_BUCKET.get(key, options);

      // 文件不存在
      if (!object) {
        return new Response('404 Not Found', { status: 404 });
      }

      // 9. 构建 HTTP 响应头
      const headers = new Headers();
      
      // 写入 R2 保存的元数据（如 Content-Type 等）
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);

      // 【核心改动】：明确禁掉浏览器与 CF 边缘节点的缓存
      headers.set('cache-control', 'no-store, no-cache, must-revalidate, max-age=0');

      // 支持跨域访问
      headers.set('access-control-allow-origin', '*');

      // 10. 状态码判定：有 Range 请求返回 206，否则返回 200
      const status = object.body ? (rangeHeader ? 206 : 200) : 304;

      // 11. 零拷贝流式返回
      return new Response(object.body, {
        status,
        headers,
      });

    } catch (err) {
      return new Response(`Server Error: ${err.message}`, { status: 500 });
    }
  },
};
