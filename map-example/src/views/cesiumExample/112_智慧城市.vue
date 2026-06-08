<template>
  <div ref="cesiumContainer" class="container"></div>
</template>

<script setup>
// 参考：https://z2586300277.github.io/three-cesium-examples/#/codeMirror?navigation=CesiumJS&classify=advancedEffect&id=cityLight
import { ref, onMounted, onUnmounted } from "vue";
import * as Cesium from "cesium";

const cesiumContainer = ref(null);
let viewer = null;

// 天地图TOKEN
const token = window.TIANDITU_TOKEN || "your_token_here";

onMounted(() => {
  // 初始化Viewer
  viewer = new Cesium.Viewer(cesiumContainer.value, {
    geocoder: false, // 关闭地理编码搜索
    homeButton: false, // 关闭主页按钮
    sceneModePicker: false, // 关闭场景模式选择器
    baseLayerPicker: false, // 关闭底图选择器
    navigationHelpButton: false, // 关闭导航帮助
    animation: false, // 关闭动画控件
    timeline: false, // 关闭时间轴
    fullscreenButton: false, // 关闭全屏按钮
    baseLayer: false, // 关闭默认地图
    infoBox: false,
    selectionIndicator: false,
  });

  // 清空logo
  viewer.cesiumWidget.creditContainer.style.display = "none";

  // 开启深度检测
  viewer.scene.globe.depthTestAgainstTerrain = true;

  initMap();
  loadTileset();
});

onUnmounted(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});

// 加载3dtiles
const loadTileset = async () => {
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      "/models/nanjjing/tileset.json"
    );

    viewer.scene.primitives.add(tileset);

    tileset.maximumScreenSpaceError = 1;

    viewer.flyTo(tileset);

    const uniforms = {
      u_sweep_color: {
        value: Cesium.Color.fromBytes(43, 167, 255, 255),
        type: Cesium.UniformType.VEC3,
      },
      u_mix_color1: {
        value: Cesium.Color.fromBytes(9, 9, 14, 255),
        type: Cesium.UniformType.VEC3,
      },
      u_mix_color2: {
        value: Cesium.Color.fromBytes(0, 128, 255, 255),
        type: Cesium.UniformType.VEC3,
      },
      u_sweep_width: { value: 0.03, type: Cesium.UniformType.FLOAT },
      u_time: { value: 0, type: Cesium.UniformType.FLOAT },
      u_model_height: { value: 100, type: Cesium.UniformType.FLOAT },
      u_height_offset: { value: 0.0, type: Cesium.UniformType.FLOAT },
    };

    const shader = new Cesium.CustomShader({
      vertexShaderText: `void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
            float adjustedZ = vsInput.attributes.positionMC.z + u_height_offset;
            float normalizedHeight = clamp(adjustedZ / u_model_height, 0.0, 1.0);
            float enhancedHeight = sqrt(normalizedHeight);
            v_uv = vec2(enhancedHeight, enhancedHeight);
        }`,
      fragmentShaderText: `float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
            float gradientFactor = smoothstep(0.0, 1.0, v_uv.y);
            vec3 originColor = mix(u_mix_color1, u_mix_color2, gradientFactor);
            float t = fract(u_time * 2.) * 2.;
            vec2 absUv = abs(v_uv - t);
            
            vec2 st = v_uv * 15.;
            vec2 ipos = floor(st + u_time * 5.);
            float r = random(ipos) + .2;
            
            float d = clamp(distance(0., absUv.y) / u_sweep_width, 0., 1.);
            float diffuse = clamp(-dot(czm_sunDirectionEC, fsInput.attributes.normalEC), 0., .45);
            
            vec3 color = mix(u_sweep_color * r + u_sweep_color * .8, originColor, d);
            material.diffuse = color;
            material.emissive = vec3(diffuse) * (1. - d);
        }`,
      uniforms,
      varyings: { v_uv: Cesium.VaryingType.VEC2 },
    });

    viewer.scene.preRender.addEventListener(function (scene, time) {
      shader.setUniform("u_time", performance.now() * 0.0001);
    });

    tileset.customShader = shader;
  } catch (error) {
    console.error("Error loading tileset:", error);
  }
};

// 加载天地图
const initMap = () => {
  // 以下为天地图及天地图标注加载
  const tiandituProvider = new Cesium.WebMapTileServiceImageryProvider({
    url:
      "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" +
      token,
    layer: "img",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "w",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"], // 子域名
    maximumLevel: 18,
    credit: new Cesium.Credit("天地图影像"),
  });
  // 天地图影像添加到viewer实例的影像图层集合中
  viewer.imageryLayers.addImageryProvider(tiandituProvider);
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
</style>
