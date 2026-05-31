// Cloudflare Pages Functions - 全局中间件
// 为所有 API 添加认证检查

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// 简单的 token 验证（生产环境建议使用更安全的方案）
const VALID_TOKEN = 'navhub_admin_token_2026';

export async function onRequest(context) {
  const { request } = context;
  
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 获取请求路径
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // 公开接口（不需要认证）
  const publicPaths = ['/api/websites'];
  const isPublicGet = request.method === 'GET' && publicPaths.includes(pathname);
  
  // 如果是公开 GET 请求，跳过认证
  if (isPublicGet) {
    return await context.next();
  }
  
  // 检查认证头
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      success: false,
      error: '未授权访问'
    }), {
      status: 401,
      headers: corsHeaders
    });
  }
  
  const token = authHeader.substring(7);
  
  // 验证 token（这里使用简单验证，生产环境建议使用 JWT）
  if (token !== VALID_TOKEN) {
    return new Response(JSON.stringify({
      success: false,
      error: '无效的认证令牌'
    }), {
      status: 403,
      headers: corsHeaders
    });
  }
  
  // 认证通过，继续处理请求
  return await context.next();
}
