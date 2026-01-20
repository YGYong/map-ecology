/**
 * 验证示例数据脚本
 * 运行此脚本以验证 examplesData.js 中的所有数据
 */

import { examples, categories } from './src/utils/examplesData.js';
import { validateAllData } from './src/utils/validateExamplesData.js';

console.log('🔍 验证示例数据...\n');

const result = validateAllData(examples, categories);

console.log(`📊 验证结果:`);
console.log(`  - 示例总数: ${examples.length}`);
console.log(`  - 分类总数: ${categories.length}`);
console.log(`  - 验证状态: ${result.valid ? '✅ 通过' : '❌ 失败'}\n`);

if (result.errors.length > 0) {
  console.log('❌ 错误:');
  result.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
  console.log('');
}

if (result.warnings.length > 0) {
  console.log('⚠️  警告:');
  result.warnings.forEach((warning, index) => {
    console.log(`  ${index + 1}. ${warning}`);
  });
  console.log('');
}

if (result.valid && result.warnings.length === 0) {
  console.log('✅ 所有数据验证通过！');
} else if (result.valid && result.warnings.length > 0) {
  console.log('✅ 数据验证通过，但有警告需要注意。');
} else {
  console.log('❌ 数据验证失败，请修复上述错误。');
  process.exit(1);
}
