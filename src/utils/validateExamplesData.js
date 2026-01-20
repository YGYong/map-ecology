/**
 * 验证示例数据格式
 * 确保所有示例数据符合要求并且代码是有效的 Vue SFC
 */

import { parseSFC } from './sfcParser.js';

/**
 * 验证单个示例数据
 * @param {Object} example - 示例对象
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateExample(example) {
  const errors = [];

  // 验证必需字段
  if (typeof example.id !== 'number') {
    errors.push(`Example missing or invalid 'id' field`);
  }

  if (typeof example.category !== 'number') {
    errors.push(`Example ${example.id || 'unknown'} missing or invalid 'category' field`);
  }

  if (typeof example.name !== 'string' || example.name.trim() === '') {
    errors.push(`Example ${example.id || 'unknown'} missing or invalid 'name' field`);
  }

  if (typeof example.preview !== 'string' || example.preview.trim() === '') {
    errors.push(`Example ${example.id || 'unknown'} missing or invalid 'preview' field`);
  }

  if (typeof example.code !== 'string' || example.code.trim() === '') {
    errors.push(`Example ${example.id || 'unknown'} missing or invalid 'code' field`);
  } else {
    // 验证代码是有效的 Vue SFC
    const parseResult = parseSFC(example.code);
    
    if (parseResult.errors && parseResult.errors.length > 0) {
      errors.push(`Example ${example.id || 'unknown'} (${example.name}) has invalid Vue SFC code: ${parseResult.errors.map(e => e.message).join(', ')}`);
    }

    // 验证必须包含 template 或 script
    if (!parseResult.template && !parseResult.script && !parseResult.scriptSetup) {
      errors.push(`Example ${example.id || 'unknown'} (${example.name}) must contain at least a template or script section`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证分类数据
 * @param {Object} category - 分类对象
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateCategory(category) {
  const errors = [];

  // 验证必需字段
  if (typeof category.id !== 'number') {
    errors.push(`Category missing or invalid 'id' field`);
  }

  if (typeof category.name !== 'string' || category.name.trim() === '') {
    errors.push(`Category ${category.id || 'unknown'} missing or invalid 'name' field`);
  }

  if (typeof category.count !== 'number' || category.count < 0) {
    errors.push(`Category ${category.id || 'unknown'} (${category.name}) missing or invalid 'count' field`);
  }

  if (!Array.isArray(category.subcategories)) {
    errors.push(`Category ${category.id || 'unknown'} (${category.name}) missing or invalid 'subcategories' field`);
  } else {
    // 验证子分类
    category.subcategories.forEach((sub, index) => {
      if (typeof sub.id !== 'number') {
        errors.push(`Category ${category.id || 'unknown'} (${category.name}) subcategory at index ${index} missing or invalid 'id' field`);
      }
      if (typeof sub.name !== 'string' || sub.name.trim() === '') {
        errors.push(`Category ${category.id || 'unknown'} (${category.name}) subcategory at index ${index} missing or invalid 'name' field`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证所有示例数据
 * @param {Array} examples - 示例数组
 * @param {Array} categories - 分类数组
 * @returns {Object} - { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateAllData(examples, categories) {
  const errors = [];
  const warnings = [];

  // 验证示例数组
  if (!Array.isArray(examples)) {
    errors.push('Examples must be an array');
    return { valid: false, errors, warnings };
  }

  // 验证分类数组
  if (!Array.isArray(categories)) {
    errors.push('Categories must be an array');
    return { valid: false, errors, warnings };
  }

  // 验证每个示例
  examples.forEach((example, index) => {
    const result = validateExample(example);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  });

  // 验证每个分类
  categories.forEach((category, index) => {
    const result = validateCategory(category);
    if (!result.valid) {
      errors.push(...result.errors);
    }
  });

  // 检查示例的 category 是否存在于 categories 中
  const categoryIds = new Set(categories.map(c => c.id));
  examples.forEach(example => {
    if (!categoryIds.has(example.category)) {
      warnings.push(`Example ${example.id} (${example.name}) references non-existent category ${example.category}`);
    }
  });

  // 检查示例 ID 是否唯一
  const exampleIds = new Set();
  examples.forEach(example => {
    if (exampleIds.has(example.id)) {
      errors.push(`Duplicate example ID: ${example.id}`);
    }
    exampleIds.add(example.id);
  });

  // 检查分类 ID 是否唯一
  const catIds = new Set();
  categories.forEach(category => {
    if (catIds.has(category.id)) {
      errors.push(`Duplicate category ID: ${category.id}`);
    }
    catIds.add(category.id);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
