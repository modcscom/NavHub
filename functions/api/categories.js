// Cloudflare Pages Functions - 分类管理 API
// 路径: /api/categories

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 默认分类数据
const defaultCategories = [
  { id: '1', name: '开发工具', icon: 'fas fa-code', color: '#3b82f6' },
  { id: '2', name: '设计资源', icon: 'fas fa-paint-brush', color: '#ec4899' },
  { id: '3', name: '学习平台', icon: 'fas fa-graduation-cap', color: '#10b981' },
  { id: '4', name: '云服务', icon: 'fas fa-cloud', color: '#8b5cf6' },
  { id: '5', name: '前端框架', icon: 'fas fa-laptop-code', color: '#f59e0b' }
];

export async function onRequestOptions() {
  return new Response(null, { headers: corsHeaders });
}

// GET - 获取所有分类
export async function onRequestGet(context) {
  try {
    const { env } = context;
    const categories = await env.NAVHUB_KV.get('categories', 'json') || defaultCategories;
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: categories 
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

// POST - 添加分类
export async function onRequestPost(context) {
  try {
    const { env, request } = context;
    const body = await request.json();
    
    if (!body.name) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '分类名称不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const categories = await env.NAVHUB_KV.get('categories', 'json') || defaultCategories;
    
    const newCategory = {
      id: Date.now().toString(),
      name: body.name,
      icon: body.icon || 'fas fa-folder',
      color: body.color || '#3b82f6',
      createdAt: new Date().toISOString()
    };
    
    categories.push(newCategory);
    await env.NAVHUB_KV.put('categories', JSON.stringify(categories));
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: newCategory 
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

// PUT - 更新分类
export async function onRequestPut(context) {
  try {
    const { env, request } = context;
    const body = await request.json();
    
    if (!body.id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '分类 ID 不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const categories = await env.NAVHUB_KV.get('categories', 'json') || defaultCategories;
    const index = categories.findIndex(c => c.id === body.id);
    
    if (index === -1) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '分类不存在' 
      }), { 
        status: 404, 
        headers: corsHeaders 
      });
    }
    
    categories[index] = { ...categories[index], ...body };
    await env.NAVHUB_KV.put('categories', JSON.stringify(categories));
    
    return new Response(JSON.stringify({ 
      success: true, 
      data: categories[index] 
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

// DELETE - 删除分类
export async function onRequestDelete(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '分类 ID 不能为空' 
      }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }
    
    const categories = await env.NAVHUB_KV.get('categories', 'json') || defaultCategories;
    const filtered = categories.filter(c => c.id !== id);
    
    await env.NAVHUB_KV.put('categories', JSON.stringify(filtered));
    
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
