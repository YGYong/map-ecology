<template>
  <div class="map-container">
    <div ref="mapContainer" id="map"></div>
    <div class="controls">
      <button @click="exportToPng" :disabled="isExporting">
        {{ isExporting ? '导出中...' : '导出为PNG' }}
      </button>
      <p class="info">点击按钮将当前地图导出为PNG图片</p>
    </div>
    
    <!-- 隐藏的下载链接 -->
    <a ref="downloadLink" style="display: none;">下载</a>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import 'ol/ol.css';

const mapContainer = ref(null);
const downloadLink = ref(null);
let map = null;

// 响应式变量
const isExporting = ref(false);

// 导出为PNG的核心函数
const exportToPng = () => {
  if (!map || isExporting.value) return;
  
  isExporting.value = true;
  
  // 等待地图渲染完成
  map.once('rendercomplete', () => {
    try {
      // 创建画布
      const mapCanvas = document.createElement('canvas');
      const size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      const mapContext = mapCanvas.getContext('2d');
      
      // 设置白色背景
      mapContext.fillStyle = '#ffffff';
      mapContext.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
      
      // 获取所有图层的canvas元素
      const canvases = map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer');
      
      if (canvases.length === 0) {
        throw new Error('没有找到可导出的图层');
      }
      
      // 将所有图层绘制到导出画布上
      Array.prototype.forEach.call(canvases, (canvas) => {
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            const opacity = canvas.parentNode.style.opacity || canvas.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            
            // 简化变换处理
            const transform = canvas.style.transform;
            if (transform && transform !== 'none') {
              // 如果有复杂变换，尝试解析
              const match = transform.match(/^matrix$$([^)]*)$$$/);
              if (match) {
                const matrix = match[1].split(',').map(Number);
                mapContext.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
              }
            } else {
              // 重置变换
              mapContext.setTransform(1, 0, 0, 1, 0, 0);
            }
            
            // 绘制图层
            mapContext.drawImage(canvas, 0, 0);
            
          } catch (canvasError) {
            console.warn('绘制图层时出错:', canvasError);
            // 继续处理其他图层
          }
        }
      });
      
      // 重置画布状态
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      
      // 创建下载链接并触发下载
      const dataURL = mapCanvas.toDataURL('image/png', 1.0);
      
      if (dataURL === 'data:,') {
        throw new Error('画布为空，无法生成图片');
      }
      
      downloadLink.value.href = dataURL;
      downloadLink.value.download = `map-${new Date().getTime()}.png`;
      downloadLink.value.click();
      
      console.log('导出成功');
      
    } catch (error) {
      console.error('导出失败:', error);
      alert(`导出失败: ${error.message}`);
    } finally {
      isExporting.value = false;
    }
  });
  
  // 触发地图重新渲染
  map.renderSync();
};

onMounted(() => {
  // 创建一些示例要素
  const features = [
    // 添加一些点要素
    new Feature({
      geometry: new Point([116.4074, 39.9042]),
      name: '北京'
    }),
    new Feature({
      geometry: new Point([121.4737, 31.2304]),
      name: '上海'
    }),
    new Feature({
      geometry: new Point([113.2644, 23.1291]),
      name: '广州'
    }),
    // 添加一个多边形要素
    new Feature({
      geometry: new Polygon([[
        [116.3, 39.8],
        [116.5, 39.8],
        [116.5, 40.0],
        [116.3, 40.0],
        [116.3, 39.8]
      ]]),
      name: '示例区域'
    })
  ];

  // 创建矢量数据源和图层
  const vectorSource = new VectorSource({
    features: features
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)'
      }),
      stroke: new Stroke({
        color: '#ff0000',
        width: 2
      }),
      image: new Circle({
        radius: 8,
        fill: new Fill({
          color: '#ff0000'
        }),
        stroke: new Stroke({
          color: '#ffffff',
          width: 2
        })
      })
    })
  });

  // 创建瓦片图层
  const tileLayer = new TileLayer({
    source: new XYZ({
      url: "https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
      crossOrigin: 'anonymous', // 添加跨域设置
    }),
  });

  // 创建视图
  const view = new View({
    center: [116.4074, 39.9042], // 北京市中心经纬度
    zoom: 8,
    projection: "EPSG:4326",
  });

  // 初始化地图
  map = new Map({
    target: mapContainer.value,
    layers: [tileLayer, vectorLayer],
    view,
  });
});

onUnmounted(() => {
  if (map) {
    map.setTarget(undefined);
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  font-family: sans-serif;
}

#map {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.controls button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  margin-bottom: 10px;
}

.controls button:hover:not(:disabled) {
  background-color: #218838;
}

.controls button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.info {
  margin: 0;
  font-size: 14px;
  color: #666;
}
</style>
