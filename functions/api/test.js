// 测试 API 是否正常工作
export async function onRequestGet() {
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'API is working!',
    time: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
