<template>
  <div class="layout">
    <header class="header bg-blue-600 text-white p-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-xl font-bold">Cesium Start Demo</h1>
        <nav>
          <ul class="flex space-x-4">
            <li><a href="#" class="hover:underline">首页</a></li>
            <li><a href="#" class="hover:underline">示例</a></li>
            <li><a href="#" class="hover:underline">文档</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main class="main flex-1">
      <slot></slot>
    </main>
    <footer class="footer bg-gray-800 text-white p-4">
      <div class="container mx-auto text-center">
        <p>© 2026 Cesium Start Demo. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'MainLayout'
}
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  background-color: #1890ff;
  color: white;
  padding: 16px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 20px;
  font-weight: bold;
}

nav ul {
  display: flex;
  gap: 16px;
  list-style: none;
}

nav a {
  color: white;
  text-decoration: none;
}

nav a:hover {
  text-decoration: underline;
}

.main {
  flex: 1;
  overflow: hidden;
}

.footer {
  background-color: #1f2329;
  color: white;
  padding: 16px;
  text-align: center;
}
</style>