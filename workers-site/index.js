import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

/**
 * Cloudflare Workers 入口
 * 处理静态资源请求和 API 请求
 */

const DEBUG = false

addEventListener('fetch', event => {
  try {
    event.respondWith(handleEvent(event))
  } catch (e) {
    if (DEBUG) {
      return event.respondWith(
        new Response(e.message || e.toString(), {
          status: 500,
        }),
      )
    }
    event.respondWith(new Response('Internal Error', { status: 500 }))
  }
})

async function handleEvent(event) {
  const url = new URL(event.request.url)
  const pathname = url.pathname

  // API 路由处理
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(event)
  }

  // 静态资源处理
  const options = {}
  
  try {
    if (DEBUG) {
      options.cacheControl = {
        bypassCache: true,
      }
    }
    
    const page = await getAssetFromKV(event, options)
    
    // 添加安全响应头
    const response = new Response(page.body, page)
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  } catch (e) {
    if (DEBUG) {
      return new Response(e.message || e.toString(), { status: 500 })
    }
    
    // 404 页面
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><title>404 - 页面未找到</title></head>
        <body style="text-align:center;padding:50px;font-family:sans-serif;">
          <h1>404</h1>
          <p>页面未找到</p>
          <a href="/">返回首页</a>
        </body>
      </html>
    `, {
      status: 404,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }
}

/**
 * API 请求处理
 */
async function handleApiRequest(event) {
  const { request } = event
  const url = new URL(request.url)
  const pathname = url.pathname
  
  // 设置 CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }
  
  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  // 获取所有网站
  if (pathname === '/api/websites' && request.method === 'GET') {
    const websites = await NAVHUB_KV.get('websites', 'json') || []
    return new Response(JSON.stringify({ success: true, data: websites }), {
      headers: corsHeaders
    })
  }
  
  // 添加网站
  if (pathname === '/api/websites' && request.method === 'POST') {
    const body = await request.json()
    const websites = await NAVHUB_KV.get('websites', 'json') || []
    
    const newWebsite = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }
    
    websites.push(newWebsite)
    await NAVHUB_KV.put('websites', JSON.stringify(websites))
    
    return new Response(JSON.stringify({ success: true, data: newWebsite }), {
      headers: corsHeaders
    })
  }
  
  // 获取分类
  if (pathname === '/api/categories' && request.method === 'GET') {
    const categories = await NAVHUB_KV.get('categories', 'json') || [
      { id: '1', name: '开发工具', icon: 'fas fa-code' },
      { id: '2', name: '设计资源', icon: 'fas fa-paint-brush' },
      { id: '3', name: '学习平台', icon: 'fas fa-graduation-cap' },
      { id: '4', name: '云服务', icon: 'fas fa-cloud' }
    ]
    return new Response(JSON.stringify({ success: true, data: categories }), {
      headers: corsHeaders
    })
  }
  
  // 获取统计数据
  if (pathname === '/api/stats' && request.method === 'GET') {
    const websites = await NAVHUB_KV.get('websites', 'json') || []
    const categories = await NAVHUB_KV.get('categories', 'json') || []
    
    const stats = {
      totalWebsites: websites.length,
      totalCategories: categories.length,
      todayVisits: Math.floor(Math.random() * 1000) + 500, // 模拟数据
      totalUsers: Math.floor(Math.random() * 500) + 100
    }
    
    return new Response(JSON.stringify({ success: true, data: stats }), {
      headers: corsHeaders
    })
  }
  
  // 404 API
  return new Response(JSON.stringify({ success: false, error: 'Not Found' }), {
    status: 404,
    headers: corsHeaders
  })
}
