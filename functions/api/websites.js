// Cloudflare Pages Functions - 网站管理 API
// 路径: /api/websites

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 处理 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET - 获取所有网站
export async function onRequestGet(context) {
  try {
    const { env } = context;
    const websites = await env.NAVHUB_KV.get('websites', 'json') || [];
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: websites 
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

// POST - 添加新网站
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const body = await request.json();
    
    // 验证必填字段
    if (!body.name || !body.url) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '网站名称和链接不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    // 获取现有数据
    const websites = await env.NAVHUB_KV.get('websites', 'json') || [];
    
    // 创建新网站对象
    const newWebsite = {
      id: Date.now().toString(),
      name: body.name,
      url: body.url,
      category: body.category || '未分类',
      description: body.description || '',
      icon: body.icon || 'fas fa-globe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // 添加到数组
    websites.push(newWebsite);
    
    // 保存到 KV
    await env.NAVHUB_KV.put('websites', JSON.stringify(websites));
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: newWebsite 
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

// PUT - 更新网站
export async function onRequestPut(context) {
  try {
    const { env, request } = context;
    const body = await request.json();
    
    if (!body.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '网站 ID 不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const websites = await env.NAVHUB_KV.get('websites', 'json') || [];
    const index = websites.findIndex(w => w.id === body.id);
    
    if (index === -1) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '网站不存在' 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }
    
    // 更新数据
    websites[index] = {
      ...websites[index],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    await env.NAVHUB_KV.put('websites', JSON.stringify(websites));
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: websites[index] 
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

// DELETE - 删除网站
export async function onRequestDelete(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '网站 ID 不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const websites = await env.NAVHUB_KV.get('websites', 'json') || [];
    const filtered = websites.filter(w => w.id !== id);
    
    if (filtered.length === websites.length) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '网站不存在' 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }
    
    await env.NAVHUB_KV.put('websites', JSON.stringify(filtered));
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: '删除成功' 
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
