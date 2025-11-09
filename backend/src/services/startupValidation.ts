/**
 * Startup Validation Service
 * Validates all required and optional services at server startup
 */

import dotenv from 'dotenv';

dotenv.config();

export interface ServiceStatus {
  name: string;
  required: boolean;
  configured: boolean;
  message: string;
}

export function validateStartup(): ServiceStatus[] {
  const services: ServiceStatus[] = [];
  
  // Required Services
  services.push({
    name: 'Supabase URL',
    required: true,
    configured: !!process.env.SUPABASE_URL,
    message: process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing SUPABASE_URL',
  });
  
  services.push({
    name: 'Supabase Service Role Key',
    required: true,
    configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    message: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing SUPABASE_SERVICE_ROLE_KEY',
  });
  
  services.push({
    name: 'DeepSeek API',
    required: true,
    configured: !!process.env.DEEPSEEK_API_KEY,
    message: process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Missing DEEPSEEK_API_KEY',
  });
  
  services.push({
    name: 'Dodo Payments API',
    required: true,
    configured: !!process.env.DODO_PAYMENTS_API_KEY,
    message: process.env.DODO_PAYMENTS_API_KEY ? '✅ Configured' : '❌ Missing DODO_PAYMENTS_API_KEY',
  });
  
  services.push({
    name: 'Dodo Webhook Secret',
    required: true,
    configured: !!process.env.DODO_WEBHOOK_SECRET,
    message: process.env.DODO_WEBHOOK_SECRET ? '✅ Configured' : '❌ Missing DODO_WEBHOOK_SECRET',
  });
  
  // Optional Services (for enhanced features)
  const scraperUrl = process.env.SCRAPER_SERVICE_URL || process.env.RENDER_SCRAPER_URL;
  services.push({
    name: 'Render Scraper Service',
    required: false,
    configured: !!scraperUrl,
    message: scraperUrl 
      ? `✅ Configured: ${scraperUrl}` 
      : 'ℹ️ Optional - using mock market data (set SCRAPER_SERVICE_URL for real scraping)',
  });
  services.push({
    name: 'LocationIQ API (Geocoding)',
    required: false,
    configured: !!process.env.LOCATIONIQ_API_KEY,
    message: process.env.LOCATIONIQ_API_KEY ? '✅ Configured' : 'ℹ️ Optional - using free tier fallbacks',
  });
  
  services.push({
    name: 'OpenCage API (Geocoding)',
    required: false,
    configured: !!process.env.OPENCAGE_API_KEY,
    message: process.env.OPENCAGE_API_KEY ? '✅ Configured' : 'ℹ️ Optional - using free tier fallbacks',
  });
  
  services.push({
    name: 'OpenRouteService API (Routing)',
    required: false,
    configured: !!process.env.OPENROUTESERVICE_API_KEY,
    message: process.env.OPENROUTESERVICE_API_KEY ? '✅ Configured' : 'ℹ️ Optional - using free tier fallbacks',
  });
  
  services.push({
    name: 'GraphHopper API (Routing)',
    required: false,
    configured: !!process.env.GRAPHHOPPER_API_KEY,
    message: process.env.GRAPHHOPPER_API_KEY ? '✅ Configured' : 'ℹ️ Optional - using free tier fallbacks',
  });
  
  services.push({
    name: 'Fixer.io API (Currency)',
    required: false,
    configured: !!process.env.FIXER_API_KEY,
    message: process.env.FIXER_API_KEY ? '✅ Configured' : 'ℹ️ Optional - using free tier fallbacks',
  });
  
  return services;
}

export function logStartupStatus(): void {
  console.log('\n🔍 ===== STARTUP VALIDATION =====');
  
  const services = validateStartup();
  const requiredServices = services.filter(s => s.required);
  const optionalServices = services.filter(s => !s.required);
  
  // Check required services
  console.log('\n📋 Required Services:');
  requiredServices.forEach(service => {
    console.log(`   ${service.message}`);
  });
  
  const missingRequired = requiredServices.filter(s => !s.configured);
  if (missingRequired.length > 0) {
    console.error('\n❌ CRITICAL: Missing required services!');
    missingRequired.forEach(service => {
      console.error(`   - ${service.name}`);
    });
    console.error('\n🛑 Server cannot start without required services.');
    console.error('   Please set the missing environment variables and restart.\n');
    process.exit(1);
  }
  
  // Check optional services
  console.log('\n📋 Optional Services:');
  optionalServices.forEach(service => {
    console.log(`   ${service.message}`);
  });
  
  const configuredOptional = optionalServices.filter(s => s.configured).length;
  console.log(`\n✅ ${requiredServices.length}/${requiredServices.length} required services configured`);
  console.log(`ℹ️  ${configuredOptional}/${optionalServices.length} optional services configured`);
  console.log('🚀 All required services available - server can start!\n');
}

export function getServiceStatus(): { healthy: boolean; services: ServiceStatus[] } {
  const services = validateStartup();
  const requiredServices = services.filter(s => s.required);
  const allRequiredConfigured = requiredServices.every(s => s.configured);
  
  return {
    healthy: allRequiredConfigured,
    services,
  };
}

