// Vue SFC 解析器
export function parseSFC(code) {
  const errors = []
  
  try {
    // 提取 <script setup> 内容
    const scriptSetupMatch = code.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/i)
    const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    
    let scriptContent = ''
    
    if (scriptSetupMatch) {
      scriptContent = scriptSetupMatch[1]
    } else if (scriptMatch) {
      scriptContent = scriptMatch[1]
    }
    
    // 提取 <template> 内容
    const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
    const templateContent = templateMatch ? templateMatch[1] : ''
    
    // 提取 <style> 内容
    const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
    const styleContent = styleMatch ? styleMatch[1] : ''
    
    return {
      script: scriptContent.trim(),
      template: templateContent.trim(),
      style: styleContent.trim(),
      errors
    }
  } catch (error) {
    errors.push({
      type: 'parse',
      message: `解析 SFC 失败: ${error.message}`,
      line: 0
    })
    
    return {
      script: '',
      template: '',
      style: '',
      errors
    }
  }
}
