import * as Cesium from 'cesium'

export class CodeExecutor {
  constructor(viewer) {
    this.viewer = viewer
    this.cleanupFunctions = []
    this.styleElement = null
    this.sandboxRoot = null
    this.originalViewerParent = null
    this.originalViewerNextSibling = null
  }

  async execute(parsed) {
    try {
      // Clean up previous execution
      this.cleanup()
      
      let { script, template, style } = parsed
      
      // 1. Process Style
      if (style) {
        this.processStyle(style)
      }

      // 2. Prepare Context (Initial)
      // Create a proxy for viewer to handle both ref usage (viewer.value) and direct usage (viewer.camera)
      const viewerProxy = new Proxy(this.viewer, {
        get(target, prop) {
          if (prop === 'value') return target
          return Reflect.get(target, prop)
        },
        set(target, prop, value) {
          if (prop === 'value') return true // Ignore assignment to viewer.value
          return Reflect.set(target, prop, value)
        }
      })

      const context = {
        Cesium,
        viewer: viewerProxy,
        console: window.console,
        document: window.document,
        window: window,
        // Mock Vue reactivity
        ref: (val) => ({ value: val }),
        reactive: (obj) => obj,
        onMounted: (fn) => {
          // Store onMounted hook to be called immediately during execution or shortly after
          // We can't use setTimeout(..., 0) if we want to ensure order relative to other synchronous code
          // But for Vue lifecycle simulation, async execution is often expected.
          setTimeout(() => {
            try {
              fn()
            } catch (error) {
              console.error('onMounted error:', error)
            }
          }, 0)
        },
        onUnmounted: (fn) => {
          this.cleanupFunctions.push(fn)
        },
        // Storage for refs found in template
        refs: {}
      }

      // 3. Render Template
      if (template) {
        this.renderTemplate(template, context)
      }

      // 4. Inject Refs into Context
      // For every ref found in template, ensure it exists in context as a ref-like object
      // This handles 'cesiumContainer', 'popup', etc.
      Object.keys(context.refs).forEach(refName => {
        // If the script relies on 'const cesiumContainer = ref(null)', we removed that line.
        // So we need to provide 'cesiumContainer' in the context.
        // We wrap the DOM element in a ref-like object.
        context[refName] = { value: context.refs[refName] }
      })

      // 5. Process Script
      if (script) {
        // Remove imports/exports
        script = script.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, '')
        script = script.replace(/import\s+['"].*?['"];?\s*/g, '')
        script = script.replace(/export\s+(default\s+)?/g, '')
        
        // Remove standard ref declarations for viewer and cesiumContainer
        // This prevents them from shadowing our context variables
        script = script.replace(/\b(let|const|var)\s+viewer\s*=\s*(?:ref\s*\(\s*null\s*\)|null)\s*;?\s*/g, '')
        script = script.replace(/\b(let|const|var)\s+cesiumContainer\s*=\s*ref\s*\(\s*null\s*\)\s*;?\s*/g, '')
        
        // Extract and Apply Viewer Configuration
        this.applyViewerConfig(script)

        // Replace Viewer Initialization
        // Matches: viewer = new Cesium.Viewer(...) OR viewer.value = new Cesium.Viewer(...)
        script = script.replace(
          /(?:viewer|viewer\.value)\s*=\s*new\s+Cesium\.Viewer\s*\([^)]*\)(?:\s*,\s*\{[\s\S]*?\})?\s*;?/g,
          '// viewer already provided'
        )

        // Transform top-level variables to context properties
        // This ensures functions like 'switchMap' defined in script are available to template via context
        script = script.replace(/^(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/gm, 'this.$1 =')
        script = script.replace(/^function\s+([a-zA-Z0-9_$]+)\s*\(/gm, 'this.$1 = function $1(')

        // Wrap code
        const wrappedCode = `
          (function() {
            with(this) {
              try {
                ${script}
              } catch (error) {
                console.error('Script execution error:', error);
                throw error;
              }
            }
          }).call(this);
        `
        
        // Execute
        const executor = new Function(wrappedCode)
        executor.call(context)
        
        // 6. Bind Events
        // We bind events AFTER script execution so that handler functions (like switchMap) are defined in context
        if (this.sandboxRoot) {
          this.bindEvents(this.sandboxRoot, context)
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Execution error:', error)
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

  applyViewerConfig(script) {
    // Relaxed regex to match new Cesium.Viewer(anyVariable, { config })
    // Matches: new Cesium.Viewer( VAR_NAME , { ... })
    // We capture the config object inside the second argument
    const match = script.match(/new\s+Cesium\.Viewer\s*\([^,]+,\s*(\{[\s\S]*?\})\)/)
    
    // Default configuration (all widgets disabled by default in our viewer setup)
    // We need to re-enable them if the user code asks for them, or disable them if explicitly set to false
    // But since our base viewer starts with most things false, we mainly look for what to enable.
    
    if (match && match[1]) {
      try {
        const configFn = new Function('Cesium', `return ${match[1]}`)
        const config = configFn(Cesium)
        
        // console.log('Applying Viewer Config:', config)
        
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
          const widget = this.viewer[widgetMap[key]]
          
          if (widget && widget.container) {
             // Logic:
             // 1. If config[key] is false -> hide
             // 2. If config[key] is true -> show
             // 3. If config[key] is undefined (default) ->
             //    Cesium default is usually TRUE for most widgets.
             //    Our viewer default is FALSE.
             //    If user code creates a "new Viewer", they expect Cesium defaults.
             //    So if they DON'T mention a widget, it should probably be SHOWN (revert to Cesium default).
             
             if (config[key] === false) {
               widget.container.style.display = 'none'
             } else {
               // If true OR undefined, show it (restore standard Cesium behavior)
               widget.container.style.display = ''
             }
          }
        })
        
        // Handle baseLayer
        // If baseLayer is false, remove all imagery layers
        if (config.baseLayer === false) {
          this.viewer.imageryLayers.removeAll()
        }
        
      } catch (e) {
        console.warn('Failed to apply viewer config:', e)
      }
    }
  }

  processStyle(style) {
    const styleEl = document.createElement('style')
    styleEl.textContent = style
    document.head.appendChild(styleEl)
    this.styleElement = styleEl
  }

  renderTemplate(template, context) {
    if (!this.originalViewerParent) {
      this.originalViewerParent = this.viewer.container.parentNode
      this.originalViewerNextSibling = this.viewer.container.nextSibling
    }

    const sandbox = document.createElement('div')
    sandbox.className = 'cesium-example-sandbox'
    sandbox.style.width = '100%'
    sandbox.style.height = '100%'
    sandbox.style.position = 'relative'
    
    sandbox.innerHTML = template
    
    // Find refs
    const allElements = sandbox.querySelectorAll('*')
    allElements.forEach(el => {
      if (el.hasAttribute('ref')) {
        const refName = el.getAttribute('ref')
        context.refs[refName] = el
        
        if (refName === 'cesiumContainer') {
          el.innerHTML = ''
          el.appendChild(this.viewer.container)
        }
      }
    })

    // Fallback if no cesiumContainer ref
    if (!context.refs['cesiumContainer']) {
       if (this.viewer.container.parentNode === this.originalViewerParent) {
         sandbox.appendChild(this.viewer.container)
       }
    }

    this.originalViewerParent.appendChild(sandbox)
    this.sandboxRoot = sandbox
  }

  bindEvents(root, context) {
    const allElements = root.querySelectorAll('*')
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('@') || attr.name.startsWith('v-on:')) {
          const eventName = attr.name.startsWith('@') ? attr.name.slice(1) : attr.name.slice(5)
          const handlerExpression = attr.value
          
          el.addEventListener(eventName, (event) => {
            try {
              // Execute handler in context
              const handler = new Function('$event', `
                with(this) {
                  ${handlerExpression}
                }
              `)
              handler.call(context, event)
            } catch (err) {
              console.error(`Event handler error (${eventName}):`, err)
            }
          })
        }
      })
    })
  }

  cleanup() {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }

    if (this.viewer && this.originalViewerParent) {
      if (this.viewer.container.parentNode !== this.originalViewerParent) {
        this.originalViewerParent.insertBefore(this.viewer.container, this.originalViewerNextSibling)
      }
    }

    if (this.sandboxRoot) {
      this.sandboxRoot.remove()
      this.sandboxRoot = null
    }

    this.cleanupFunctions.forEach(fn => {
      try { fn() } catch (e) { console.error(e) }
    })
    this.cleanupFunctions = []
    
    // Reset Viewer State
    if (this.viewer) {
      const widgets = [
        'geocoder', 'homeButton', 'sceneModePicker', 'baseLayerPicker',
        'navigationHelpButton', 'animation', 'timeline', 'fullscreenButton'
      ]
      widgets.forEach(w => {
        if (this.viewer[w] && this.viewer[w].container) {
          this.viewer[w].container.style.display = ''
        }
      })
      if (this.viewer.cesiumWidget && this.viewer.cesiumWidget.creditContainer) {
        this.viewer.cesiumWidget.creditContainer.style.display = ''
      }
    }
  }
}
