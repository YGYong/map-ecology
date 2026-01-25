<template>
  <div class="code-editor">
    <div v-if="showHeader" class="editor-header flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
      <h3 class="font-semibold text-white">代码编辑器</h3>
      <el-button size="small" type="primary" @click="runCode">运行代码</el-button>
    </div>
    <div class="editor-content" ref="editorContent" :class="{ 'h-full': !showHeader }">
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
    },
    showHeader: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      code: this.modelValue,
      editor: null,
      resizeObserver: null,
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.editor) {
      try {
        const element = this.editor.getWrapperElement();
        if (element && element.remove) {
          element.remove();
        }
        this.editor.toTextArea();
        this.editor = null;
      } catch (error) {
        console.warn('Error cleaning up CodeMirror:', error);
      }
    }
  },
  methods: {
    initEditor() {
      // Ensure textarea exists
      if (!this.$refs.textarea) return;

      this.editor = CodeMirror.fromTextArea(this.$refs.textarea, {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: false, // Disable wrapping to prevent height calculation issues
        autoCloseBrackets: true,
        matchBrackets: false, // Disable to avoid runtime errors
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        tabSize: 2,
        indentUnit: 2,
        indentWithTabs: false,
        styleActiveLine: true,
        viewportMargin: Infinity, // Ensure content is rendered
        extraKeys: {
          'Ctrl-S': () => { this.runCode(); return false; },
          'Cmd-S': () => { this.runCode(); return false; },
          'Ctrl-Space': 'autocomplete',
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

      // Update code when editor changes
      this.editor.on('change', () => {
        this.code = this.editor.getValue();
        this.$emit('update:modelValue', this.code);
      });

      // Enable autocomplete
      this.editor.on('inputRead', (cm, change) => {
        if (change.text[0].match(/[a-zA-Z.]/)) {
          CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
        }
      });

      // Set up ResizeObserver to handle layout changes
      if (this.$refs.editorContent && window.ResizeObserver) {
        this.resizeObserver = new ResizeObserver(() => {
          if (this.editor) {
            // Use requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
            requestAnimationFrame(() => {
              this.editor.refresh();
            });
          }
        });
        this.resizeObserver.observe(this.$refs.editorContent);
      }
      
      // Initial refresh
      setTimeout(() => {
        if (this.editor) this.editor.refresh();
      }, 100);
    },
    
    // Custom hint function for Cesium API autocomplete
    cesiumHint(cm) {
      const cursor = cm.getCursor();
      const token = cm.getTokenAt(cursor);
      const start = token.start;
      const end = cursor.ch;
      const line = cursor.line;
      const currentWord = token.string;
      const lineText = cm.getLine(line).substring(0, end);
      
      const cesiumMatch = lineText.match(/Cesium\.(\w*)$/);
      const viewerMatch = lineText.match(/viewer\.(\w*)$/);
      
      let list = [];
      
      if (cesiumMatch) {
        const prefix = cesiumMatch[1].toLowerCase();
        list = this.cesiumKeywords
          .filter(keyword => keyword !== 'Cesium' && keyword.toLowerCase().startsWith(prefix))
          .map(k => ({ text: k, displayText: k, className: 'cesium-hint' }));
      } else if (viewerMatch) {
        const viewerProps = ['scene', 'camera', 'entities', 'dataSources', 'canvas', 'zoomTo', 'flyTo', 'destroy', 'render'];
        const prefix = viewerMatch[1].toLowerCase();
        list = viewerProps
          .filter(p => p.toLowerCase().startsWith(prefix))
          .map(p => ({ text: p, displayText: p, className: 'viewer-hint' }));
      } else if (currentWord && currentWord.length > 0) {
        const prefix = currentWord.toLowerCase();
        list = this.cesiumKeywords
          .filter(k => k.toLowerCase().startsWith(prefix))
          .map(k => ({ text: k, displayText: k, className: 'cesium-hint' }));
      }

      if (list.length === 0 && CodeMirror.hint.javascript) {
        return CodeMirror.hint.javascript(cm);
      }

      return {
        list: list,
        from: CodeMirror.Pos(line, start),
        to: CodeMirror.Pos(line, end)
      };
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
  display: flex;
  flex-direction: column;
}

.editor-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  flex-shrink: 0;
}

.editor-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Ensure CodeMirror takes full height of its container */
.editor-content :deep(.CodeMirror) {
  height: 100% !important;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.editor-content :deep(.CodeMirror-gutters) {
  background-color: #282a36 !important;
  border-right: 1px solid #444 !important;
}

/* Hint styles */
.editor-content :deep(.CodeMirror-hints) {
  background: #282a36 !important;
  border: 1px solid #444 !important;
  z-index: 1000;
}

.editor-content :deep(.CodeMirror-hint) {
  color: #f8f8f2 !important;
}

.editor-content :deep(.CodeMirror-hint-active) {
  background: #44475a !important;
  color: #50fa7b !important;
}
</style>
