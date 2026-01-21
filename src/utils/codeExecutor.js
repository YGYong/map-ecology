import * as Cesium from 'cesium'

export class CodeExecutor {
  constructor(viewer) {
    this.viewer = viewer
    this.cleanupFunctions = []
    this.createdElements = [] // 跟踪创建的 DOM 元素
  }

  async execute(parsed) {
    try {
      // 清理之前的执行
      this.cleanup()
      
      let { script, template, style } = parsed
      
      console.log('原始脚本:', script)
      console.log('模板:', template)
      
      if (!script) {
        return {
          success: false,
          error: {
            type: 'parse',
            message: '没有找到可执行的脚本代码'
          }
        }
      }
      
      // 处理 template 中的 DOM 元素
      let templateElements = {}
      if (template) {
        templateElements = this.processTemplate(template)
      }
      
      // 移除 import 语句
      script = script.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
      script = script.replace(/import\s+['"].*?['"];?\s*/g, '')
      
      // 移除 export 语句
      script = script.replace(/export\s+(default\s+)?/g, '')
      
      // 移除 viewer 和 cesiumContainer 变量声明
      script = script.replace(/\b(let|const|var)\s+viewer\s*=\s*null\s*;?\s*/g, '// viewer 已由系统提供\n')
      script = script.replace(/\b(let|const|var)\s+cesiumContainer\s*=\s*ref\s*\(\s*null\s*\)\s*;?\s*/g, '// cesiumContainer 已由系统提供\n')
      script = script.replace(/\b(let|const|var)\s+popup\s*=\s*ref\s*\(\s*null\s*\)\s*;?\s*/g, '// popup 已由系统提供\n')
      
      // 提取并应用 Viewer 配置
      const viewerConfigMatch = script.match(/new\s+Cesium\.Viewer\s*\([^,)]*,\s*\{[\s\S]*?\}\s*\)/m)
      if (viewerConfigMatch) {
        const fullMatch = viewerConfigMatch[0]
        const configMatch = fullMatch.match(/\{[\s\S]*?\}/)
        
        if (configMatch) {
          const configStr = configMatch[0]
          console.log('检测到 Viewer 配置:', configStr)
          
          try {
            const config = eval(`(${configStr})`)
            console.log('解析后的配置:', config)
            
            // 应用配置
            const widgetMap = {
              geocoder: 'geocoder',
              homeButton: 'homeButton',
              sceneModePicker: 'sceneModePicker',
              baseLayerPicker: 'baseLayerPicker',
              navigationHelpButton: 'navigationHelpButton',
              animation: 'animation',
              timeline: 'timeline',
              fullscreenButton: 'fullscreenButton'
            }
            
            Object.keys(widgetMap).forEach(key => {
              if (config[key] === false) {
                const widget = this.viewer[widgetMap[key]]
                if (widget && widget.container) {
                  widget.container.style.display = 'none'
                }
              }
            })
            
            if (config.baseLayer === false) {
              this.viewer.imageryLayers.removeAll()
            }
            
            if (this.viewer.cesiumWidget && this.viewer.cesiumWidget.creditContainer) {
              this.viewer.cesiumWidget.creditContainer.style.display = 'none'
            }
          } catch (error) {
            console.warn('应用 Viewer 配置失败:', error)
          }
        }
      }
      
      // 替换 new Cesium.Viewer
      script = script.replace(
        /viewer\s*=\s*new\s+Cesium\.Viewer\s*\([^)]*\)\s*;?/g,
        '// viewer 已由系统提供，配置已应用'
      )
      
      // 处理 creditContainer 隐藏
      script = script.replace(
        /viewer\.cesiumWidget\.creditContainer\.style\.display\s*=\s*['"]none['"]\s*;?/g,
        '// logo 已隐藏'
      )
      
      // 将 const/let 转换为 var
      script = script.replace(/\bconst\s+/g, 'var ')
      script = script.replace(/\blet\s+/g, 'var ')
      
      console.log('处理后的脚本:', script)
      
      // 创建执行上下文
      const context = {
        Cesium,
        viewer: this.viewer,
        console: window.console,
        document: window.document,
        // 提供 ref 函数，返回 template 中对应的元素
        ref: (initialValue) => {
          // 查找对应的 ref 元素
          for (const [refName, element] of Object.entries(templateElements)) {
            if (initialValue === null) {
              // cesiumContainer 返回 viewer 容器
              if (refName === 'cesiumContainer') {
                return { value: this.viewer.container }
              }
              // 其他 ref 返回对应的元素
              return { value: element }
            }
          }
          return { value: initialValue }
        },
        onMounted: (fn) => {
          setTimeout(() => {
            try {
              console.log('执行 onMounted 回调')
              fn()
            } catch (error) {
              console.error('onMounted 回调执行错误:', error)
              throw error
            }
          }, 0)
        },
        onUnmounted: (fn) => {
          this.cleanupFunctions.push(fn)
        },
        // 提供 template 中的元素引用
        ...templateElements
      }
      
      // 包装代码以便执行
      const wrappedCode = `
        (function() {
          const { Cesium, viewer, console, document, ref, onMounted, onUnmounted, popup, cesiumContainer } = this;
          console.log('开始执行用户代码');
          try {
            ${script}
            console.log('用户代码执行完成');
          } catch (error) {
            console.error('代码执行错误:', error);
            throw error;
          }
        }).call(context);
      `
      
      console.log('准备执行代码')
      
      // 执行代码
      const executor = new Function('context', wrappedCode)
      executor(context)
      
      console.log('代码执行成功')
      
      return {
        success: true
      }
    } catch (error) {
      console.error('代码执行错误:', error)
      
      return {
        success: false,
        error: {
          type: 'runtime',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  // 处理 template，创建对应的 DOM 元素
  processTemplate(template) {
    const elements = {}
    
    // 查找所有带 ref 的元素
    const refPattern = /ref="(\w+)"/g
    let match
    
    while ((match = refPattern.exec(template)) !== null) {
      const refName = match[1]
      
      // 为每个 ref 创建对应的元素
      if (refName === 'cesiumContainer') {
        // cesiumContainer 使用 viewer 的容器
        elements[refName] = { value: this.viewer.container }
      } else if (refName === 'popup') {
        // 创建气泡窗口元素
        const popup = document.createElement('div')
        popup.className = 'popup-window'
        
        // 从 template 中提取内容
        const popupContentMatch = template.match(/<div[^>]*ref="popup"[^>]*>(.*?)<\/div>/s)
        if (popupContentMatch) {
          popup.innerHTML = popupContentMatch[1]
        }
        
        // 从 style 中提取样式（如果有）
        popup.style.cssText = `
          position: absolute;
          padding: 12px 18px;
          background-color: rgba(44, 62, 80, 0.85);
          color: #ecf0f1;
          border: 1px solid #3498db;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
          text-align: center;
          min-width: 120px;
          pointer-events: none;
          transform: translate(-50%, -100%);
          z-index: 1000;
        `
        
        // 添加到 viewer 容器
        this.viewer.container.appendChild(popup)
        this.createdElements.push(popup)
        
        elements[refName] = { value: popup }
      }
    }
    
    return elements
  }

  async executeJs(script) {
    try {
      // 清理之前的执行
      this.cleanup()
      
      console.log('执行纯 JS 代码:', script)
      
      if (!script || !script.trim()) {
        return {
          success: false,
          error: {
            type: 'parse',
            message: '代码为空'
          }
        }
      }
      
      // 创建执行上下文
      const context = {
        Cesium,
        viewer: this.viewer,
        console: window.console,
        document: window.document,
        onUnmounted: (fn) => {
          this.cleanupFunctions.push(fn)
        }
      }
      
      // 包装代码以便执行
      const wrappedCode = `
        (function() {
          const { Cesium, viewer, console, document, onUnmounted } = this;
          console.log('开始执行用户代码');
          try {
            ${script}
            console.log('用户代码执行完成');
          } catch (error) {
            console.error('代码执行错误:', error);
            throw error;
          }
        }).call(context);
      `
      
      console.log('准备执行代码')
      
      // 执行代码
      const executor = new Function('context', wrappedCode)
      executor(context)
      
      console.log('代码执行成功')
      
      return {
        success: true
      }
    } catch (error) {
      console.error('代码执行错误:', error)
      
      return {
        success: false,
        error: {
          type: 'runtime',
          message: error.message,
          stack: error.stack
        }
      }
    }
  }

  cleanup() {
    // 执行清理函数
    this.cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.error('清理函数执行失败:', error)
      }
    })
    
    // 移除创建的 DOM 元素
    this.createdElements.forEach(element => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    
    // 重置 viewer 控件显示
    if (this.viewer) {
      const widgets = [
        'geocoder', 'homeButton', 'sceneModePicker', 'baseLayerPicker',
        'navigationHelpButton', 'animation', 'timeline', 'fullscreenButton'
      ]
      
      widgets.forEach(widget => {
        if (this.viewer[widget] && this.viewer[widget].container) {
          this.viewer[widget].container.style.display = ''
        }
      })
      
      if (this.viewer.cesiumWidget && this.viewer.cesiumWidget.creditContainer) {
        this.viewer.cesiumWidget.creditContainer.style.display = ''
      }
    }
    
    this.cleanupFunctions = []
    this.createdElements = []
  }
}
