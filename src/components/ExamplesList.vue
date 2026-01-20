<template>
  <div class="examples-list p-4">
    <div class="container">
      <h2 class="text-2xl font-bold mb-6">Cesium 示例</h2>
      <div class="grid">
        <div 
          v-for="example in examples" 
          :key="example.id"
          class="example-card"
          @click="selectExample(example)"
        >
          <h3 class="text-lg font-semibold mb-2">{{ example.title }}</h3>
          <p class="text-gray-600 mb-3">{{ example.description }}</p>
          <div class="flex justify-end">
            <el-button size="small" type="primary">查看</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExamplesList',
  data() {
    return {
      examples: [
        {
          id: 1,
          title: '基础场景',
          description: '创建一个基本的 Cesium 场景，显示地球和默认地形',
          code: `
// 初始化 Cesium 查看器
const viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain(),
  imageryProvider: new Cesium.UrlTemplateImageryProvider({
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    credit: '© OpenStreetMap contributors'
  })
});

// 设置初始视角
viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(116.397428, 39.90923, 10000),
  orientation: {
    heading: Cesium.Math.toRadians(0),
    pitch: Cesium.Math.toRadians(-45),
    roll: 0
  }
});
          `
        }
      ]
    }
  },
  methods: {
    selectExample(example) {
      this.$emit('select', example);
    }
  }
}
</script>

<style scoped>
.examples-list {
  padding: 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.examples-list h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.example-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.example-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.example-card h3 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.example-card p {
  color: #666;
  margin-bottom: 12px;
}

.flex {
  display: flex;
  justify-content: flex-end;
}
</style>