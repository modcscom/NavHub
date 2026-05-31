// Cloudflare Pages Functions - 统计数据 API
// 路径: /api/stats

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET - 获取统计数据
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // 获取数据
    const websites = await env.NAVHUB_KV.get('websites', 'json') || [];
    const categories = await env.NAVHUB_KV.get('categories', 'json') || [];
    
    // 计算统计数据（模拟数据）
    const stats = {
      totalWebsites: websites.length,
      totalCategories: categories.length || 5,
      todayVisits: Math.floor(Math.random() * 5000) + 1000,
      totalUsers: Math.floor(Math.random() * 2000) + 500,
      lastUpdated: new Date().toISOString()
    };
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: stats 
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
