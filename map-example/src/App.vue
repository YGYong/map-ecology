<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="['CesiumExamples', 'LeafletExamples', 'OpenLayersExamples', 'Home']">
        <component :is="Component" :key="$route.fullPath" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
}
</style>