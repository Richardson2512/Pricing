/**
 * Keep Render Scraper Service Alive
 * 
 * Render free tier services go to sleep after 15 minutes of inactivity.
 * This script pings the health endpoint every 10 minutes to keep it awake.
 * 
 * Usage:
 *   node scripts/keep-render-alive.js
 * 
 * Or run in background:
 *   nohup node scripts/keep-render-alive.js > logs/render-pinger.log 2>&1 &
 */

const RENDER_URL = process.env.RENDER_SCRAPER_URL || 'https://your-scraper-service.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const HEALTH_ENDPOINT = '/health';

let pingCount = 0;
let successCount = 0;
let failureCount = 0;

async function pingRenderService() {
  pingCount++;
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] 🔄 Ping #${pingCount}: Checking Render service...`);
    
    const startTime = Date.now();
    const response = await fetch(`${RENDER_URL}${HEALTH_ENDPOINT}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'KeepAlive-Script/1.0',
      },
    });
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      successCount++;
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Ping #${pingCount}: SUCCESS (${duration}ms)`);
      console.log(`   Status: ${data.status || 'ok'}`);
      console.log(`   Stats: ${successCount} success, ${failureCount} failures`);
    } else {
      failureCount++;
      console.error(`[${timestamp}] ⚠️ Ping #${pingCount}: HTTP ${response.status} (${duration}ms)`);
      console.error(`   Stats: ${successCount} success, ${failureCount} failures`);
    }
  } catch (error) {
    failureCount++;
    console.error(`[${timestamp}] ❌ Ping #${pingCount}: FAILED`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Stats: ${successCount} success, ${failureCount} failures`);
  }
  
  console.log(`   Next ping in ${PING_INTERVAL / 60000} minutes\n`);
}

// Initial ping
console.log('🚀 Starting Render Keep-Alive Service');
console.log(`📡 Target: ${RENDER_URL}${HEALTH_ENDPOINT}`);
console.log(`⏱️  Interval: ${PING_INTERVAL / 60000} minutes`);
console.log(`🕐 Started at: ${new Date().toISOString()}\n`);

pingRenderService();

// Set up interval
const intervalId = setInterval(pingRenderService, PING_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  clearInterval(intervalId);
  console.log(`📊 Final Stats: ${successCount} success, ${failureCount} failures, ${pingCount} total pings`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  clearInterval(intervalId);
  console.log(`📊 Final Stats: ${successCount} success, ${failureCount} failures, ${pingCount} total pings`);
  process.exit(0);
});

// Keep process alive
process.stdin.resume();

