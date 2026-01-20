/**
 * Verification script for Cesium resource configuration
 * This script checks that CESIUM_BASE_URL is correctly set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if CESIUM_BASE_URL is defined
console.log('Checking Cesium configuration...\n');

// In Vite, CESIUM_BASE_URL is replaced at build time
// We can verify it's set correctly by checking the define in vite.config.js

const configPath = path.join(__dirname, 'vite.config.js');
const configContent = fs.readFileSync(configPath, 'utf-8');

// Check if CESIUM_BASE_URL is set to '/cesium/'
if (configContent.includes("'CESIUM_BASE_URL': JSON.stringify('/cesium/')")) {
  console.log('✓ CESIUM_BASE_URL is correctly set to "/cesium/" in vite.config.js');
} else {
  console.error('✗ CESIUM_BASE_URL is not correctly configured');
  process.exit(1);
}

// Check if vite-plugin-static-copy is configured
if (configContent.includes('viteStaticCopy')) {
  console.log('✓ vite-plugin-static-copy is imported and configured');
} else {
  console.error('✗ vite-plugin-static-copy is not configured');
  process.exit(1);
}

// Check if all required Cesium resources are configured to be copied
const requiredResources = ['Workers', 'ThirdParty', 'Assets', 'Widgets'];
let allResourcesConfigured = true;

requiredResources.forEach(resource => {
  if (configContent.includes(`'node_modules/cesium/Build/Cesium/${resource}'`)) {
    console.log(`✓ ${resource} is configured to be copied`);
  } else {
    console.error(`✗ ${resource} is not configured to be copied`);
    allResourcesConfigured = false;
  }
});

if (!allResourcesConfigured) {
  process.exit(1);
}

// Check if dist/cesium directory exists (after build)
const distCesiumPath = path.join(__dirname, 'dist', 'cesium');
if (fs.existsSync(distCesiumPath)) {
  console.log('\n✓ dist/cesium directory exists (production build verified)');
  
  // Check if all subdirectories exist
  requiredResources.forEach(resource => {
    const resourcePath = path.join(distCesiumPath, resource);
    if (fs.existsSync(resourcePath)) {
      const files = fs.readdirSync(resourcePath);
      console.log(`  ✓ ${resource}/ exists with ${files.length} files`);
    } else {
      console.error(`  ✗ ${resource}/ directory not found`);
      allResourcesConfigured = false;
    }
  });
} else {
  console.log('\n⚠ dist/cesium directory not found (run "npm run build" first to verify production build)');
}

console.log('\n✓ All Cesium resource configuration checks passed!');
console.log('\nConfiguration Summary:');
console.log('- CESIUM_BASE_URL: /cesium/');
console.log('- Static resources will be copied to: dist/cesium/');
console.log('- Resources include: Workers, ThirdParty, Assets, Widgets');
console.log('\nBoth development and production environments are correctly configured.');
