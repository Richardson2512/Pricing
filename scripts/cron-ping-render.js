/**
 * Cron-based Render Keep-Alive Service
 * 
 * Uses node-cron to ping Render service on a schedule.
 * More reliable than setInterval for long-running processes.
 * 
 * Install: npm install node-cron
 * Usage: node scripts/cron-ping-render.js
 * 
 * Cron Schedule: Every 10 minutes
 */

const cron = require('node-cron');

const RENDER_URL = process.env.RENDER_SCRAPER_URL || 'https://your-scraper-service.onrender.com';
const HEALTH_ENDPOINT = '/health';
const CRON_SCHEDULE = '*/10 * * * *'; // Every 10 minutes

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
        'User-Agent': 'KeepAlive-Cron/1.0',
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });
    
    const duration = Date.now() - startTime;
    
    if (response.ok) {
      successCount++;
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Ping #${pingCount}: SUCCESS (${duration}ms)`);
      console.log(`   Status: ${data.status || 'ok'}`);
      console.log(`   Environment: ${data.environment || 'unknown'}`);
      console.log(`   Stats: ${successCount} success, ${failureCount} failures`);
      
      // Alert if service is slow
      if (duration > 5000) {
        console.warn(`   ⚠️ WARNING: Slow response (${duration}ms) - service may be waking up`);
      }
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
    
    // Alert if too many failures
    if (failureCount > 5 && failureCount / pingCount > 0.5) {
      console.error(`   🚨 ALERT: High failure rate (${Math.round(failureCount / pingCount * 100)}%)`);
    }
  }
  
  console.log('');
}

// Validate cron schedule
if (!cron.validate(CRON_SCHEDULE)) {
  console.error('❌ Invalid cron schedule:', CRON_SCHEDULE);
  process.exit(1);
}

console.log('🚀 Starting Render Keep-Alive Cron Service');
console.log(`📡 Target: ${RENDER_URL}${HEALTH_ENDPOINT}`);
console.log(`⏱️  Schedule: ${CRON_SCHEDULE} (every 10 minutes)`);
console.log(`🕐 Started at: ${new Date().toISOString()}\n`);

// Initial ping
pingRenderService();

// Schedule cron job
const task = cron.schedule(CRON_SCHEDULE, () => {
  pingRenderService();
}, {
  scheduled: true,
  timezone: 'UTC'
});

console.log('✅ Cron job scheduled successfully\n');

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  task.stop();
  console.log(`📊 Final Stats: ${successCount} success, ${failureCount} failures, ${pingCount} total pings`);
  console.log(`📈 Success Rate: ${pingCount > 0 ? Math.round(successCount / pingCount * 100) : 0}%`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  task.stop();
  console.log(`📊 Final Stats: ${successCount} success, ${failureCount} failures, ${pingCount} total pings`);
  console.log(`📈 Success Rate: ${pingCount > 0 ? Math.round(successCount / pingCount * 100) : 0}%`);
  process.exit(0);
});

// Keep process alive
process.stdin.resume();

