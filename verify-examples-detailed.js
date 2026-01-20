/**
 * 详细验证示例数据脚本
 * 检查每个示例的 Vue SFC 代码结构
 */

import { examples, categories } from './src/utils/examplesData.js';
import { parseSFC } from './src/utils/sfcParser.js';

console.log('🔍 详细验证示例数据...\n');

let allValid = true;

examples.forEach((example, index) => {
  console.log(`\n📝 示例 ${index + 1}: ${example.name} (ID: ${example.id})`);
  console.log(`   分类: ${example.category}`);
  
  // 解析 SFC
  const parsed = parseSFC(example.code);
  
  // 检查各部分
  console.log(`   ✓ Template: ${parsed.template ? '存在' : '缺失'}`);
  console.log(`   ✓ Script: ${parsed.script ? '存在' : '缺失'}`);
  console.log(`   ✓ Script Setup: ${parsed.scriptSetup ? '存在' : '缺失'}`);
  console.log(`   ✓ Style: ${parsed.style ? '存在' : '缺失'}`);
  
  // 检查是否使用了 Composition API
  if (parsed.scriptSetup || parsed.script) {
    const scriptContent = parsed.scriptSetup || parsed.script;
    const hasRef = scriptContent.includes('ref(');
    const hasOnMounted = scriptContent.includes('onMounted');
    const hasCesium = scriptContent.includes('Cesium');
    
    console.log(`   ✓ 使用 ref: ${hasRef ? '是' : '否'}`);
    console.log(`   ✓ 使用 onMounted: ${hasOnMounted ? '是' : '否'}`);
    console.log(`   ✓ 使用 Cesium API: ${hasCesium ? '是' : '否'}`);
    
    if (!hasCesium) {
      console.log(`   ⚠️  警告: 示例未使用 Cesium API`);
    }
  }
  
  // 检查 template 是否包含 cesiumContainer ref
  if (parsed.template) {
    const hasCesiumContainer = parsed.template.includes('cesiumContainer');
    console.log(`   ✓ 包含 cesiumContainer ref: ${hasCesiumContainer ? '是' : '否'}`);
    
    if (!hasCesiumContainer) {
      console.log(`   ⚠️  警告: Template 未包含 cesiumContainer ref`);
    }
  }
  
  // 检查解析错误
  if (parsed.errors && parsed.errors.length > 0) {
    console.log(`   ❌ 解析错误:`);
    parsed.errors.forEach(err => {
      console.log(`      - ${err.message} (行 ${err.line})`);
    });
    allValid = false;
  }
  
  // 检查 preview 格式
  if (example.preview.startsWith('data:image/svg+xml;base64,')) {
    console.log(`   ✓ Preview: SVG Base64 格式`);
  } else if (example.preview.startsWith('http')) {
    console.log(`   ✓ Preview: URL 格式`);
  } else {
    console.log(`   ⚠️  警告: Preview 格式不标准`);
  }
});

console.log('\n\n📊 分类验证:');
categories.forEach((category, index) => {
  console.log(`\n${index + 1}. ${category.name} (ID: ${category.id})`);
  console.log(`   示例数量: ${category.count}`);
  console.log(`   子分类数量: ${category.subcategories.length}`);
  
  // 统计实际属于该分类的示例数量
  const actualCount = examples.filter(e => e.category === category.id).length;
  if (actualCount !== category.count && actualCount > 0) {
    console.log(`   ⚠️  警告: 声明的示例数量 (${category.count}) 与实际数量 (${actualCount}) 不匹配`);
  }
});

console.log('\n\n' + '='.repeat(60));
if (allValid) {
  console.log('✅ 所有示例数据验证通过！');
} else {
  console.log('❌ 发现错误，请修复后重试。');
  process.exit(1);
}
