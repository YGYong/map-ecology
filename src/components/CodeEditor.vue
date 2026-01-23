<template>
  <div class="code-editor">
    <div v-if="showHeader" class="editor-header flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
      <h3 class="font-semibold text-white">代码编辑器</h3>
      <el-button size="small" type="primary" @click="runCode">运行代码</el-button>
    </div>
    <div class="editor-content" :class="{ 'h-full': !showHeader }">
      <textarea ref="textarea" v-model="code"></textarea>
    </div>
  </div>
</template>

<script>
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/vue/vue';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/comment-fold';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/selection/active-line';

export default {
  name: 'CodeEditor',
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      code: this.modelValue,
      editor: null,
      syntaxCheckTimer: null, // Debounce timer for syntax checking
      // Cesium API keywords for autocomplete
      cesiumKeywords: [
        'Cesium', 'Viewer', 'Entity', 'Cartesian3', 'Cartesian2', 'Color',
        'HeadingPitchRoll', 'Transforms', 'Math', 'Camera', 'Scene',
        'ImageryLayer', 'Terrain', 'DataSource', 'GeoJsonDataSource',
        'CzmlDataSource', 'KmlDataSource', 'EntityCollection', 'Billboard',
        'Label', 'Point', 'Polyline', 'Polygon', 'Model', 'Primitive',
        'GroundPrimitive', 'ClassificationPrimitive', 'PointPrimitive',
        'BillboardCollection', 'LabelCollection', 'PolylineCollection',
        'PrimitiveCollection', 'Material', 'Appearance', 'GeometryInstance',
        'BoxGeometry', 'CircleGeometry', 'CorridorGeometry', 'CylinderGeometry',
        'EllipseGeometry', 'EllipsoidGeometry', 'PolygonGeometry', 'PolylineGeometry',
        'RectangleGeometry', 'SphereGeometry', 'WallGeometry', 'Ion',
        'IonResource', 'Resource', 'RequestScheduler', 'TileMapServiceImageryProvider',
        'UrlTemplateImageryProvider', 'WebMapServiceImageryProvider',
        'WebMapTileServiceImageryProvider', 'ArcGisMapServerImageryProvider',
        'BingMapsImageryProvider', 'GoogleEarthEnterpriseMapsProvider',
        'MapboxImageryProvider', 'MapboxStyleImageryProvider', 'OpenStreetMapImageryProvider',
        'SingleTileImageryProvider', 'TileCoordinatesImageryProvider',
        'CesiumTerrainProvider', 'EllipsoidTerrainProvider', 'VRTheWorldTerrainProvider',
        'GoogleEarthEnterpriseTerrainProvider', 'ArcGISTiledElevationTerrainProvider',
        'Clock', 'Timeline', 'Animation', 'BaseLayerPicker', 'FullscreenButton',
        'Geocoder', 'HomeButton', 'InfoBox', 'NavigationHelpButton',
        'SceneModePicker', 'SelectionIndicator', 'VRButton', 'ScreenSpaceEventHandler',
        'ScreenSpaceEventType', 'KeyboardEventModifier', 'Matrix3', 'Matrix4',
        'Quaternion', 'Rectangle', 'BoundingSphere', 'OrientedBoundingBox',
        'Plane', 'Ray', 'Ellipsoid', 'GeographicProjection', 'WebMercatorProjection',
        'JulianDate', 'TimeInterval', 'TimeIntervalCollection', 'ClockRange',
        'ClockStep', 'Iso8601', 'LeapSecond', 'TimeStandard', 'CallbackProperty',
        'CompositeProperty', 'ConstantProperty', 'PropertyBag', 'SampledProperty',
        'TimeIntervalCollectionProperty', 'VelocityOrientationProperty',
        'PositionPropertyArray', 'PropertyArray', 'ReferenceProperty'
      ]
    }
  },
  watch: {
    modelValue(newValue) {
      this.code = newValue;
      if (this.editor) {
        const currentValue = this.editor.getValue();
        if (currentValue !== newValue) {
          const cursor = this.editor.getCursor();
          this.editor.setValue(newValue);
          this.editor.setCursor(cursor);
        }
      }
    }
  },
  mounted() {
    this.initEditor();
  },
  beforeUnmount() {
    // Clean up debounce timer
    if (this.syntaxCheckTimer) {
      clearTimeout(this.syntaxCheckTimer);
      this.syntaxCheckTimer = null;
    }
    
    if (this.editor) {
      try {
        // 移除所有事件监听器
        this.editor.off('change');
        this.editor.off('inputRead');
        this.editor.off('blur');
        
        // 清除所有标记
        const marks = this.editor.getAllMarks();
        marks.forEach(mark => {
          try {
            mark.clear();
          } catch (e) {
            // 忽略清除标记时的错误
          }
        });
        
        // 销毁编辑器
        this.editor.toTextArea();
        this.editor = null;
      } catch (error) {
        console.warn('清理 CodeMirror 编辑器时出错:', error);
      }
    }
  },
  methods: {
    initEditor() {
      this.editor = CodeMirror.fromTextArea(this.$refs.textarea, {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: false, // 禁用括号匹配以避免错误
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        tabSize: 2,
        indentUnit: 2,
        indentWithTabs: false,
        styleActiveLine: true,
        extraKeys: {
          // Ctrl+S / Cmd+S to run code
          'Ctrl-S': (_cm) => {
            this.runCode();
            return false;
          },
          'Cmd-S': (_cm) => {
            this.runCode();
            return false;
          },
          // Ctrl+Space for autocomplete
          'Ctrl-Space': 'autocomplete',
          // Tab for proper indentation
          'Tab': (cm) => {
            if (cm.somethingSelected()) {
              cm.indentSelection('add');
            } else {
              cm.replaceSelection(cm.getOption('indentWithTabs') ? '\t' : 
                Array(cm.getOption('indentUnit') + 1).join(' '), 'end', '+input');
            }
          }
        },
        hintOptions: {
          completeSingle: false,
          hint: this.cesiumHint
        }
      });

      // Requirement 9.1: Debounce syntax checking to avoid performance issues
      this.editor.on('change', () => {
        this.code = this.editor.getValue();
        this.$emit('update:modelValue', this.code);
        
        // Debounce syntax checking (300ms delay)
        if (this.syntaxCheckTimer) {
          clearTimeout(this.syntaxCheckTimer);
        }
        
        this.syntaxCheckTimer = setTimeout(() => {
          this.performSyntaxCheck();
        }, 300);
      });

      // Enable autocomplete on input
      this.editor.on('inputRead', (cm, change) => {
        if (change.text[0].match(/[a-zA-Z.]/)) {
          CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
      });
    },
    
    // Custom hint function for Cesium API autocomplete
    cesiumHint(cm) {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      const start = token.start;
      const end = cursor.ch;
      const line = cursor.line;
      const currentWord = token.string;

      // Get the text before cursor to check for Cesium context
      const lineText = cm.getLine(line).substring(0, end);
      
      // Check if we're in a Cesium context (after "Cesium." or "viewer.")
      const cesiumMatch = lineText.match(/Cesium\.(\w*)$/);
      const viewerMatch = lineText.match(/viewer\.(\w*)$/);
      
      let list = [];
      
      if (cesiumMatch) {
        // After "Cesium.", suggest Cesium API classes
        const prefix = cesiumMatch[1].toLowerCase();
        list = this.cesiumKeywords
          .filter(keyword => keyword !== 'Cesium' && keyword.toLowerCase().startsWith(prefix))
          .map(keyword => ({
            text: keyword,
            displayText: keyword,
            className: 'cesium-hint'
          }));
      } else if (viewerMatch) {
        // After "viewer.", suggest viewer properties and methods
        const viewerProps = [
          'scene', 'camera', 'entities', 'dataSources', 'canvas', 'clock',
          'screenSpaceEventHandler', 'targetFrameRate', 'useDefaultRenderLoop',
          'resolutionScale', 'useBrowserRecommendedResolution', 'automaticallyTrackDataSourceClocks',
          'clockTrackedDataSource', 'trackedEntity', 'selectedEntity',
          'zoomTo', 'flyTo', 'destroy', 'render', 'resize', 'forceResize',
          'extend', 'isDestroyed'
        ];
        const prefix = viewerMatch[1].toLowerCase();
        list = viewerProps
          .filter(prop => prop.toLowerCase().startsWith(prefix))
          .map(prop => ({
            text: prop,
            displayText: prop,
            className: 'viewer-hint'
          }));
      } else if (currentWord && currentWord.length > 0) {
        // General autocomplete for Cesium keywords
        const prefix = currentWord.toLowerCase();
        list = this.cesiumKeywords
          .filter(keyword => keyword.toLowerCase().startsWith(prefix))
          .map(keyword => ({
            text: keyword,
            displayText: keyword,
            className: 'cesium-hint'
          }));
      }

      // Fallback to default JavaScript hints if no Cesium-specific matches
      if (list.length === 0 && CodeMirror.hint.javascript) {
        return CodeMirror.hint.javascript(cm);
      }

      return {
        list: list,
        from: CodeMirror.Pos(line, start),
        to: CodeMirror.Pos(line, end)
      };
    },
    
    /**
     * Perform syntax checking (debounced)
     * Requirement 9.1: Debounce syntax checking to avoid performance issues
     * 
     * This is a lightweight syntax check that doesn't block the UI.
     * Full parsing and validation happens during code execution.
     */
    performSyntaxCheck() {
      // Basic syntax validation without blocking the UI
      // This could be extended to use a web worker for more complex checks
      try {
        // Simple check: ensure code has basic Vue SFC structure
        const code = this.code;
        if (code && code.trim()) {
          // Check for basic template/script tags
          const hasTemplate = /<template[^>]*>/.test(code);
          const hasScript = /<script[^>]*>/.test(code);
          
          // Emit syntax check result (can be used by parent for visual feedback)
          this.$emit('syntaxCheck', {
            valid: hasTemplate || hasScript,
            hasTemplate,
            hasScript
          });
        }
      } catch (error) {
        // Silently fail - full validation happens during execution
        console.debug('[CodeEditor] Syntax check error:', error.message);
      }
    },
    
    runCode() {
      this.$emit('run', this.code);
    }
  }
}
</script>

<style scoped>
.code-editor {
  border: 1px solid #333;
  border-radius: 4px;
  overflow: hidden;
  height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.editor-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
}

.editor-content {
  height: calc(100% - 48px);
}

.editor-content.h-full {
  height: 100%;
}

.editor-content :deep(.CodeMirror) {
  height: 100%;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  line-height: 1.5;
}

.editor-content :deep(.CodeMirror-gutters) {
  background-color: #282a36 !important;
  border-right: 1px solid #444 !important;
}

.editor-content :deep(.CodeMirror-linenumber) {
  color: #888 !important;
}

.editor-content :deep(.CodeMirror-cursor) {
  border-left: 2px solid #f8f8f2 !important;
}

.editor-content :deep(.CodeMirror-activeline-background) {
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Autocomplete hint styles */
.editor-content :deep(.CodeMirror-hints) {
  background: #282a36 !important;
  border: 1px solid #444 !important;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  max-height: 300px;
  overflow-y: auto;
}

.editor-content :deep(.CodeMirror-hint) {
  color: #f8f8f2 !important;
  padding: 4px 8px;
  border-radius: 2px;
}

.editor-content :deep(.CodeMirror-hint-active) {
  background: #44475a !important;
  color: #50fa7b !important;
}

.editor-content :deep(.cesium-hint) {
  color: #8be9fd !important;
}

.editor-content :deep(.viewer-hint) {
  color: #ff79c6 !important;
}

/* Active line highlight */
.editor-content :deep(.CodeMirror-activeline .CodeMirror-gutter-elt) {
  background: rgba(255, 255, 255, 0.05) !important;
}
</style>