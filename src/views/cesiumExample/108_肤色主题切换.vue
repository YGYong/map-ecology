<template>
    <div ref="cesiumContainer" class="container"></div>
    <!-- 换肤按钮 -->
    <div class="theme-panel">
        <div class="theme-label">主题切换</div>
        <div class="theme-buttons">
            <button v-for="(theme, index) in themes" :key="index"
                :class="['theme-btn', { active: currentTheme === index }]" :style="{ backgroundColor: theme.color }"
                @click="switchTheme(index)" :title="theme.name">
                {{ theme.name }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as Cesium from "cesium";

const cesiumContainer = ref(null);
let viewer = null;
let colorFilterStage = null;

const token = window.TIANDITU_TOKEN;

const currentTheme = ref(0);

const themes = ref([
    {
        name: "科技蓝",
        color: "#1a5fb4",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [25 / 255, 107 / 255, 210 / 255],
    },
    {
        name: "暗夜紫",
        color: "#8b5cf6",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [100 / 255, 50 / 255, 200 / 255],
    },
    {
        name: "翠绿",
        color: "#10b981",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [30 / 255, 180 / 255, 100 / 255],
    },
    {
        name: "赤红",
        color: "#ef4444",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [220 / 255, 50 / 255, 50 / 255],
    },
    {
        name: "金橙",
        color: "#f59e0b",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [220 / 255, 140 / 255, 30 / 255],
    },
    {
        name: "青色",
        color: "#06b6d4",
        brightness: 0.6,
        contrast: 1.8,
        gamma: 0.3,
        filterRGB: [20 / 255, 180 / 255, 200 / 255],
    },
    {
        name: "原始",
        color: "#9ca3af",
        isOriginal: true,
    },
]);

const createColorFilterStage = () => {
    const fragmentShader = `
    uniform sampler2D colorTexture;
    uniform vec3 filterColor;
    uniform bool enabled;
    in vec2 v_textureCoordinates;

    void main() {
      vec4 color = texture(colorTexture, v_textureCoordinates);
      
      if (enabled) {
        // 反色
        vec3 inverted = vec3(1.0) - color.rgb;
        // 应用颜色滤镜
        vec3 filtered = inverted * filterColor;
        out_FragColor = vec4(filtered, color.a);
      } else {
        out_FragColor = color;
      }
    }
  `;

    colorFilterStage = new Cesium.PostProcessStage({
        fragmentShader: fragmentShader,
        uniforms: {
            filterColor: new Cesium.Cartesian3(25 / 255, 107 / 255, 210 / 255),
            enabled: true,
        },
    });

    viewer.scene.postProcessStages.add(colorFilterStage);
};

const switchTheme = (index) => {
    currentTheme.value = index;
    const theme = themes.value[index];
    const baseLayer = viewer.imageryLayers.get(0);

    if (theme.isOriginal) {
        // 原始主题：禁用滤镜，重置图层属性
        if (colorFilterStage) {
            colorFilterStage.uniforms.enabled = false;
        }
        if (baseLayer) {
            baseLayer.brightness = 1;
            baseLayer.contrast = 1;
            baseLayer.gamma = 1;
            baseLayer.hue = 0;
            baseLayer.saturation = 1;
        }
    } else {
        // 彩色主题：启用滤镜并更新颜色
        if (colorFilterStage) {
            colorFilterStage.uniforms.enabled = true;
            colorFilterStage.uniforms.filterColor = new Cesium.Cartesian3(
                theme.filterRGB[0],
                theme.filterRGB[1],
                theme.filterRGB[2],
            );
        }
        if (baseLayer) {
            baseLayer.brightness = theme.brightness ?? 0.6;
            baseLayer.contrast = theme.contrast ?? 1.8;
            baseLayer.gamma = theme.gamma ?? 0.3;
            baseLayer.hue = 0;
            baseLayer.saturation = 0;
        }
    }

    viewer.scene.requestRender();
};

onMounted(() => {
    viewer = new Cesium.Viewer(cesiumContainer.value, {
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        baseLayer: false,
    });
    viewer.cesiumWidget.creditContainer.style.display = "none";

    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(118.796, 32.06, 5000),
    });

    viewer.imageryLayers.addImageryProvider(
        new Cesium.UrlTemplateImageryProvider({
            url: "https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=2&style=8&x={x}&y={y}&z={z}",
            maximumLevel: 18,
        }),
    );

    createColorFilterStage();

    // 应用默认主题
    const theme = themes.value[currentTheme.value];
    if (!theme.isOriginal) {
        const baseLayer = viewer.imageryLayers.get(0);
        if (baseLayer) {
            baseLayer.brightness = theme.brightness ?? 0.6;
            baseLayer.contrast = theme.contrast ?? 1.8;
            baseLayer.gamma = theme.gamma ?? 0.3;
            baseLayer.saturation = 0;
        }
    }
});

const initTianditu = () => {
    const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
        url:
            "http://{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
            token,
        layer: "vec",
        style: "default",
        format: "tiles",
        tileMatrixSetID: "w",
        subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
        maximumLevel: 18,
    });

    viewer.imageryLayers.addImageryProvider(tiandituProvider);
};
</script>

<style scoped>
.container {
    width: 100vw;
    height: 100vh;
}

.theme-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 15px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.theme-label {
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 12px;
    text-align: center;
}

.theme-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    max-width: 240px;
}

.theme-btn {
    padding: 8px 14px;
    border: 2px solid transparent;
    border-radius: 6px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    flex: 0 0 calc(50% - 5px);
    text-align: center;
}

.theme-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.theme-btn.active {
    border-color: #fff;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
    transform: scale(1.05);
}
</style>