export default {
  async fetch(request, env) {
    let url = new URL(request.url);

    // 1. 处理 favicon
    if (url.pathname === '/favicon.ico') {
      return new Response(null, { status: 204 });
    }

    // 2. 预设允许访问的前缀白名单
    const allowedPrefixes = [
      '/setu_pic',
      '/setu',
      '/zrsetu_pic',
      '/zrsetu'.
      '/acg_pic',
    ];

    // 3. 拦截显式禁止的 zip 路径（双重保险）
    const isZipPath = url.pathname.startsWith('/setu_zip') || url.pathname.startsWith('/zrsetu_zip');

    // 4. 检查是否符合允许条件：必须在前缀白名单中，且不能是 zip 路径
    const isAllowed = allowedPrefixes.some(prefix => url.pathname.startsWith(prefix)) && !isZipPath;

    // 如果不在白名单内，直接拒之门外
    if (!isAllowed) {
      return new Response('Access Denied: This path is not allowed via this route.', { 
        status: 403,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }

    // --- 以下是原本的 R2 代理逻辑 ---

    // 替换为你的 R2 存储桶公共域名
    url.hostname = 'pub-eb56c075642a4c229a1ca8eb4b4ecb31.r2.dev';
    
    // 深度克隆请求头，并删掉 host，防止内部环路报错
    let newHeaders = new Headers(request.headers);
    newHeaders.delete("host");
    
    // 发起 R2 请求
    let response = await fetch(url.toString(), {
      method: request.method,
      headers: newHeaders,
      redirect: "follow"
    });

    // 流式返回数据
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  },
};
