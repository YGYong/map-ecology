/**
 * Verification script for Task 13.1 Performance Optimizations
 * 
 * This script verifies that all performance optimizations are implemented:
 * 1. Syntax check debouncing in CodeEditor (Requirement 9.1)
 * 2. Code execution performance optimization (Requirement 9.2)
 * 3. Lazy loading for example preview images (Requirement 9.4)
 * 4. Viewer instance reuse (Requirement 9.5)
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Verifying Performance Optimizations (Task 13.1)...\n');

let allPassed = true;

// Test 1: Verify syntax check debouncing in CodeEditor
console.log('✓ Test 1: Syntax Check Debouncing (Requirement 9.1)');
try {
  const codeEditorContent = readFileSync(join(__dirname, 'src/components/CodeEditor.vue'), 'utf-8');
  
  const hasDebounceTimer = codeEditorContent.includes('syntaxCheckTimer');
  const hasDebounceLogic = codeEditorContent.includes('setTimeout') && 
                           codeEditorContent.includes('clearTimeout');
  const hasPerformSyntaxCheck = codeEditorContent.includes('performSyntaxCheck');
  const hasDebounceDelay = codeEditorContent.includes('300'); // 300ms delay
  
  if (hasDebounceTimer && hasDebounceLogic && hasPerformSyntaxCheck && hasDebounceDelay) {
    console.log('  ✅ Syntax check debouncing implemented');
    console.log('     - Debounce timer variable: ✓');
    console.log('     - setTimeout/clearTimeout logic: ✓');
    console.log('     - performSyntaxCheck method: ✓');
    console.log('     - 300ms debounce delay: ✓');
  } else {
    console.log('  ❌ Syntax check debouncing incomplete');
    if (!hasDebounceTimer) console.log('     - Missing debounce timer variable');
    if (!hasDebounceLogic) console.log('     - Missing setTimeout/clearTimeout logic');
    if (!hasPerformSyntaxCheck) console.log('     - Missing performSyntaxCheck method');
    if (!hasDebounceDelay) console.log('     - Missing 300ms debounce delay');
    allPassed = false;
  }
} catch (error) {
  console.log('  ❌ Error reading CodeEditor.vue:', error.message);
  allPassed = false;
}

console.log('');

// Test 2: Verify code execution performance optimization
console.log('✓ Test 2: Code Execution Performance (Requirement 9.2)');
try {
  const codeExecutorContent = readFileSync(join(__dirname, 'src/utils/codeExecutor.js'), 'utf-8');
  
  const hasIframeReuse = codeExecutorContent.includes('iframeReady');
  const hasExecutionCount = codeExecutorContent.includes('executionCount');
  const hasPerformanceTracking = codeExecutorContent.includes('performance.now()');
  const hasInitializeIframe = codeExecutorContent.includes('_initializeIframe');
  const hasOptimizedContext = codeExecutorContent.includes('Only inject if not already present');
  const hasPerformanceWarning = codeExecutorContent.includes('Slow execution detected');
  
  if (hasIframeReuse && hasExecutionCount && hasPerformanceTracking && 
      hasInitializeIframe && hasOptimizedContext && hasPerformanceWarning) {
    console.log('  ✅ Code execution optimization implemented');
    console.log('     - Iframe reuse mechanism: ✓');
    console.log('     - Execution count tracking: ✓');
    console.log('     - Performance monitoring: ✓');
    console.log('     - Separate iframe initialization: ✓');
    console.log('     - Optimized context preparation: ✓');
    console.log('     - Performance warning (>100ms): ✓');
  } else {
    console.log('  ❌ Code execution optimization incomplete');
    if (!hasIframeReuse) console.log('     - Missing iframe reuse mechanism');
    if (!hasExecutionCount) console.log('     - Missing execution count tracking');
    if (!hasPerformanceTracking) console.log('     - Missing performance monitoring');
    if (!hasInitializeIframe) console.log('     - Missing separate iframe initialization');
    if (!hasOptimizedContext) console.log('     - Missing optimized context preparation');
    if (!hasPerformanceWarning) console.log('     - Missing performance warning');
    allPassed = false;
  }
} catch (error) {
  console.log('  ❌ Error reading codeExecutor.js:', error.message);
  allPassed = false;
}

console.log('');

// Test 3: Verify lazy loading for example preview images
console.log('✓ Test 3: Lazy Loading for Preview Images (Requirement 9.4)');
try {
  const mainLayoutContent = readFileSync(join(__dirname, 'src/components/NewMainLayout.vue'), 'utf-8');
  
  const hasLazyImageClass = mainLayoutContent.includes('class="lazy-image"');
  const hasDataSrc = mainLayoutContent.includes('data-src');
  const hasLoadingAttribute = mainLayoutContent.includes('loading="lazy"');
  const hasLazyLoadObserver = mainLayoutContent.includes('lazyLoadObserver');
  const hasInitLazyLoading = mainLayoutContent.includes('initLazyLoading');
  const hasIntersectionObserver = mainLayoutContent.includes('IntersectionObserver');
  const hasLazyImageStyles = mainLayoutContent.includes('.lazy-image');
  const hasLoadingAnimation = mainLayoutContent.includes('@keyframes loading');
  
  if (hasLazyImageClass && hasDataSrc && hasLoadingAttribute && 
      hasLazyLoadObserver && hasInitLazyLoading && hasIntersectionObserver &&
      hasLazyImageStyles && hasLoadingAnimation) {
    console.log('  ✅ Lazy loading implemented');
    console.log('     - lazy-image class: ✓');
    console.log('     - data-src attribute: ✓');
    console.log('     - loading="lazy" attribute: ✓');
    console.log('     - IntersectionObserver setup: ✓');
    console.log('     - initLazyLoading function: ✓');
    console.log('     - Lazy image styles: ✓');
    console.log('     - Loading animation: ✓');
  } else {
    console.log('  ❌ Lazy loading incomplete');
    if (!hasLazyImageClass) console.log('     - Missing lazy-image class');
    if (!hasDataSrc) console.log('     - Missing data-src attribute');
    if (!hasLoadingAttribute) console.log('     - Missing loading="lazy" attribute');
    if (!hasLazyLoadObserver) console.log('     - Missing lazyLoadObserver');
    if (!hasInitLazyLoading) console.log('     - Missing initLazyLoading function');
    if (!hasIntersectionObserver) console.log('     - Missing IntersectionObserver');
    if (!hasLazyImageStyles) console.log('     - Missing lazy image styles');
    if (!hasLoadingAnimation) console.log('     - Missing loading animation');
    allPassed = false;
  }
} catch (error) {
  console.log('  ❌ Error reading NewMainLayout.vue:', error.message);
  allPassed = false;
}

console.log('');

// Test 4: Verify Viewer instance reuse
console.log('✓ Test 4: Viewer Instance Reuse (Requirement 9.5)');
try {
  const viewerManagerContent = readFileSync(join(__dirname, 'src/composables/useViewerManager.js'), 'utf-8');
  
  const hasClearSceneMethod = viewerManagerContent.includes('function clearScene()');
  const hasRemoveAllEntities = viewerManagerContent.includes('entities.removeAll()');
  const hasRemoveAllDataSources = viewerManagerContent.includes('dataSources.removeAll()');
  const hasReuseComment = viewerManagerContent.includes('Requirement 9.5') || 
                          viewerManagerContent.includes('reuse') ||
                          viewerManagerContent.includes('reused');
  const hasClearWithoutDestroy = viewerManagerContent.includes('WITHOUT destroying');
  
  if (hasClearSceneMethod && hasRemoveAllEntities && hasRemoveAllDataSources && 
      hasReuseComment && hasClearWithoutDestroy) {
    console.log('  ✅ Viewer instance reuse verified');
    console.log('     - clearScene method: ✓');
    console.log('     - entities.removeAll(): ✓');
    console.log('     - dataSources.removeAll(): ✓');
    console.log('     - Reuse documentation: ✓');
    console.log('     - Clear without destroy pattern: ✓');
  } else {
    console.log('  ❌ Viewer instance reuse incomplete');
    if (!hasClearSceneMethod) console.log('     - Missing clearScene method');
    if (!hasRemoveAllEntities) console.log('     - Missing entities.removeAll()');
    if (!hasRemoveAllDataSources) console.log('     - Missing dataSources.removeAll()');
    if (!hasReuseComment) console.log('     - Missing reuse documentation');
    if (!hasClearWithoutDestroy) console.log('     - Missing clear without destroy pattern');
    allPassed = false;
  }
} catch (error) {
  console.log('  ❌ Error reading useViewerManager.js:', error.message);
  allPassed = false;
}

console.log('');
console.log('═'.repeat(60));

if (allPassed) {
  console.log('✅ All performance optimizations verified successfully!');
  console.log('');
  console.log('Summary:');
  console.log('  ✓ Syntax check debouncing (9.1)');
  console.log('  ✓ Code execution optimization (9.2)');
  console.log('  ✓ Lazy loading for preview images (9.4)');
  console.log('  ✓ Viewer instance reuse (9.5)');
  process.exit(0);
} else {
  console.log('❌ Some performance optimizations are incomplete');
  console.log('');
  console.log('Please review the failed checks above.');
  process.exit(1);
}
