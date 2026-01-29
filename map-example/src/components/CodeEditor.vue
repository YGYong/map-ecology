<template>
  <div class="code-editor">
    <div class="editor-content" ref="editorContent">
      <textarea ref="textarea" v-model="code"></textarea>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
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
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/selection/active-line';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  showHeader: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'run', 'syntaxCheck']);

const code = ref(props.modelValue);
const textarea = ref(null);
const editorContent = ref(null);

let editor = null;
let resizeObserver = null;
let syntaxCheckTimer = null;

const cesiumKeywords = [
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
];

watch(() => props.modelValue, (newValue) => {
  code.value = newValue;
  if (editor) {
    const currentValue = editor.getValue();
    if (currentValue !== newValue) {
      const cursor = editor.getCursor();
      editor.setValue(newValue);
      editor.setCursor(cursor);
    }
  }
});

onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (syntaxCheckTimer) {
    clearTimeout(syntaxCheckTimer);
    syntaxCheckTimer = null;
  }

  if (editor) {
    try {
      // 移除所有事件监听器
      editor.off('change');
      editor.off('inputRead');

      const element = editor.getWrapperElement();
      if (element && element.remove) {
        element.remove();
      }
      editor.toTextArea();
      editor = null;
    } catch (error) {
      console.warn('Error cleaning up CodeMirror:', error);
    }
  }
});

function initEditor() {
  if (!textarea.value) return;

  editor = CodeMirror.fromTextArea(textarea.value, {
    mode: 'htmlmixed',
    theme: 'dracula',
    lineNumbers: true,
    lineWrapping: true,
    autoCloseBrackets: true,
    matchBrackets: false,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    styleActiveLine: true,
    viewportMargin: Infinity,
    extraKeys: {
      'Ctrl-S': () => { runCode(); return false; },
      'Cmd-S': () => { runCode(); return false; },
      'Ctrl-/': (cm) => { toggleLineComment(cm); return false; },
      'Cmd-/': (cm) => { toggleLineComment(cm); return false; },
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
      hint: cesiumHint
    }
  });

  editor.on('change', () => {
    code.value = editor.getValue();
    emit('update:modelValue', code.value);

    // Debounce syntax checking
    if (syntaxCheckTimer) {
      clearTimeout(syntaxCheckTimer);
    }
    syntaxCheckTimer = setTimeout(() => {
      performSyntaxCheck();
    }, 300);
  });

  editor.on('inputRead', (cm, change) => {
    if (change.text[0].match(/[a-zA-Z.]/)) {
      CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
    }
  });

  // Set up ResizeObserver
  if (editorContent.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      if (editor) {
        requestAnimationFrame(() => {
          editor.refresh();
        });
      }
    });
    resizeObserver.observe(editorContent.value);
  }

  // Initial refresh
  setTimeout(() => {
    if (editor) editor.refresh();
  }, 100);
}

function toggleLineComment(cm) {
  const selections = cm.listSelections()
  let startLine = Infinity
  let endLine = -Infinity

  selections.forEach(sel => {
    const a = sel.anchor
    const h = sel.head
    const from = Math.min(a.line, h.line)
    const to = Math.max(a.line, h.line)
    startLine = Math.min(startLine, from)
    endLine = Math.max(endLine, to)
  })

  if (!Number.isFinite(startLine) || !Number.isFinite(endLine) || endLine < startLine) return

  if (cm.somethingSelected()) {
    const lastSel = selections[selections.length - 1]
    const a = lastSel.anchor
    const h = lastSel.head
    const fromLine = Math.min(a.line, h.line)
    const toLine = Math.max(a.line, h.line)
    const lastLineCh = (a.line === toLine ? a.ch : h.ch)
    if (fromLine !== toLine && lastLineCh === 0) {
      endLine = Math.max(startLine, endLine - 1)
    }
  }

  const lines = []
  for (let line = startLine; line <= endLine; line++) {
    const text = cm.getLine(line)
    if (text.trim().length === 0) continue
    lines.push({ line, text })
  }

  if (lines.length === 0) return

  const allCommented = lines.every(({ text }) => /^\s*\/\//.test(text))

  cm.operation(() => {
    lines.forEach(({ line, text }) => {
      if (allCommented) {
        const next = text.replace(/^(\s*)\/\/\s?/, '$1')
        cm.replaceRange(next, { line, ch: 0 }, { line, ch: text.length })
      } else {
        const indentMatch = text.match(/^(\s*)/)
        const indent = indentMatch ? indentMatch[1] : ''
        const next = `${indent}// ${text.slice(indent.length)}`
        cm.replaceRange(next, { line, ch: 0 }, { line, ch: text.length })
      }
    })
  })
}

function cesiumHint(cm) {
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
    list = cesiumKeywords
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
    list = cesiumKeywords
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
}

function performSyntaxCheck() {
  try {
    const content = code.value;
    if (content && content.trim()) {
      const hasTemplate = /<template[^>]*>/.test(content);
      const hasScript = /<script[^>]*>/.test(content);

      emit('syntaxCheck', {
        valid: hasTemplate || hasScript,
        hasTemplate,
        hasScript
      });
    }
  } catch (error) {
    console.debug('[CodeEditor] Syntax check error:', error.message);
  }
}

function runCode() {
  emit('run', code.value);
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
  height: calc(100% - 48px);
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

.editor-content :deep(.cesium-hint) {
  color: #8be9fd !important;
}

.editor-content :deep(.viewer-hint) {
  color: #ff79c6 !important;
}
</style>
