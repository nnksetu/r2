export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    if (url.pathname.startsWith('/')) {
      url.hostname = 'https://1717131a88149718861403ea3ada74de.r2.cloudflarestorage.com/setutime'; // 替换为你的存储桶给出的域名
      
      // 基于原作者的写法：先克隆一份请求
      let new_request = new Request(url, request);
      
      // 关键修正：必须把克隆请求里的 host 请求头删掉！
      // 否则 R2 看到 host 是你的自定义域名，而不是 example.r2.dev，就会报错或找不到文件
      new_request.headers.delete("host");
      
      return fetch(new_request);
    }
    return env.ASSETS.fetch(request);
  },
};
