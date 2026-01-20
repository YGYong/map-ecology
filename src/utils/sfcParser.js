import { parse } from '@vue/compiler-sfc'

/**
 * Parse a Vue Single File Component (SFC) into its constituent parts
 * 
 * @param {string} code - The Vue SFC code to parse
 * @returns {ParsedSFC} Object containing template, script, scriptSetup, style, and errors
 * 
 * @typedef {Object} ParsedSFC
 * @property {string|null} template - The template section content
 * @property {string|null} script - The script section content
 * @property {string|null} scriptSetup - The script setup section content
 * @property {string|null} style - The style section content
 * @property {Array<{message: string, line: number}>} errors - Array of parsing errors
 */
export function parseSFC(code) {
  try {
    const { descriptor, errors } = parse(code, {
      filename: 'example.vue'
    })
    
    return {
      template: descriptor.template?.content || null,
      script: descriptor.script?.content || null,
      scriptSetup: descriptor.scriptSetup?.content || null,
      style: descriptor.styles[0]?.content || null,
      errors: errors.map(err => ({
        message: err.message,
        line: err.loc?.start.line || 0
      }))
    }
  } catch (error) {
    return {
      template: null,
      script: null,
      scriptSetup: null,
      style: null,
      errors: [{ message: error.message, line: 0 }]
    }
  }
}
