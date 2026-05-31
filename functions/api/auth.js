// Cloudflare Pages Functions - 认证 API
// 路径: /api/auth

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 管理员密码（生产环境应在环境变量中设置）
const ADMIN_PASSWORD = 'admin123';
const AUTH_TOKEN = 'navhub_admin_token_2026';

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// POST - 登录验证
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    
    // 验证密码
    if (body.password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({
        success: false,
        error: '密码错误'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    
    // 可选：记录登录日志到 KV
    if (env.NAVHUB_KV) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        userAgent: request.headers.get('User-Agent') || 'unknown'
      };
      
      const logs = await env.NAVHUB_KV.get('login_logs', 'json') || [];
      logs.push(logEntry);
      // 只保留最近100条
      if (logs.length > 100) logs.shift();
      await env.NAVHUB_KV.put('login_logs', JSON.stringify(logs));
    }
    
    // 返回认证令牌
    return new Response(JSON.stringify({
      success: true,
      data: {
        token: AUTH_TOKEN,
        expiresIn: 86400 // 24小时
      }
    }), { headers: corsHeaders });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// GET - 验证 token 是否有效
export async function onRequestGet(context) {
  try {
    const { request } = context;
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: '未提供认证令牌'
      }), {
        status: 401,
        headers: corsHeaders
      });
    }
    
    const token = authHeader.substring(7);
    
    if (token === AUTH_TOKEN) {
      return new Response(JSON.stringify({
        success: true,
        data: { valid: true }
      }), { headers: corsHeaders });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: '无效的令牌'
      }), {
        status: 403,
        headers: corsHeaders
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
