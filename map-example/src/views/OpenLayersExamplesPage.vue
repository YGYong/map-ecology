<template>
  <div class="framework-examples-page">
    <top-navbar />

    <div class="main-container">
      <aside class="sidebar">
        <div class="search-box">
          <el-input
            v-model="keyword"
            placeholder="请输入关键字搜索"
            size="small"
            clearable
          />
        </div>

        <el-menu
          :default-openeds="defaultOpeneds"
          class="category-menu"
          :collapse-transition="false"
        >
          <el-sub-menu
            v-for="category in categoriesData"
            :key="category.id"
            :index="category.id.toString()"
          >
            <template #title>
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ category.count }})</span>
            </template>
            <el-menu-item
              v-for="subcategory in category.subcategories"
              :key="subcategory.id"
              :index="subcategory.id.toString()"
              :class="{ active: selectedSubcategory === subcategory.id }"
              @click="selectSubcategory(subcategory, category)"
            >
              <span class="subcategory-name">{{ subcategory.name }}</span>
              <span class="subcategory-count"
                >({{ getExamplesBySubcategory(subcategory.id).length }})</span
              >
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>

      <main class="content-area" ref="examplesContainer">
        <div class="content-header">
          <h2 class="content-title">
            <span class="title-icon">{{ currentCategoryIcon }}</span>
            {{ currentCategoryName }} / {{ currentSubcategoryName }}
          </h2>
        </div>

        <div class="examples-container">
          <div
            v-for="category in categoriesData"
            :key="category.id"
            class="category-section"
          >
            <div
              v-for="subcategory in category.subcategories"
              :key="subcategory.id"
              class="subcategory-section"
              :id="`subcategory-${subcategory.id}`"
            >
              <h3 class="subcategory-title">
                <span class="subcategory-icon">{{ category.icon }}</span>
                {{ subcategory.name }} ({{
                  getExamplesBySubcategory(subcategory.id).length
                }})
              </h3>
              <div class="examples-grid">
                <div
                  v-for="example in getExamplesBySubcategory(subcategory.id)"
                  :key="example.id"
                  class="example-card"
                  @click="goToExample(example.id)"
                >
                  <div class="example-preview">
                    <img
                      :src="getPreviewImage(example)"
                      :alt="example.name"
                      loading="lazy"
                    />
                  </div>
                  <div class="example-info">{{ example.name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onActivated } from "vue";

defineOptions({
  name: "OpenLayersExamples",
});
import { useRouter } from "vue-router";
import TopNavbar from "../components/TopNavbar.vue";
import { getFrameworkCatalog } from "@/utils/frameworkExamples";
import placeholder from "@/assets/example-placeholder.svg";

const router = useRouter();

// 滚动位置保存
const examplesContainer = ref(null);
const SCROLL_POS_KEY = "ol_examples_scroll_pos";

// 恢复滚动位置的函数
function restoreScrollPosition() {
  const savedPos = sessionStorage.getItem(SCROLL_POS_KEY);
  if (savedPos && examplesContainer.value) {
    setTimeout(() => {
      examplesContainer.value.scrollTop = parseInt(savedPos);
    }, 0);
  }
}

// 生命周期
onMounted(() => {
  restoreScrollPosition();
});

// keep-alive 激活时恢复
onActivated(() => {
  restoreScrollPosition();
});

const keyword = ref("");

const assetPreviews = import.meta.glob(
  "../assets/openlayersImg/*.{png,jpg,jpeg,webp,svg,gif}",
  {
    eager: true,
    import: "default",
  },
);

const exampleImages = import.meta.glob(
  "../views/openlayersExample/**/imgs/*.{png,jpg,jpeg,webp,svg,gif}",
  {
    eager: true,
    import: "default",
  },
);

const { categories, examples } = getFrameworkCatalog("openlayers");

const categoriesData = categories;

const examplesData = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return examples;
  return examples.filter(
    (ex) =>
      ex.name.toLowerCase().includes(kw) || ex.id.toLowerCase().includes(kw),
  );
});

const defaultOpeneds = computed(() =>
  categoriesData.map((c) => c.id.toString()),
);

const selectedCategory = ref(categoriesData[0]?.id ?? 0);
const selectedSubcategory = ref(categoriesData[0]?.subcategories?.[0]?.id ?? 0);

const currentCategoryName = computed(() => {
  const category = categoriesData.find(
    (cat) => cat.id === selectedCategory.value,
  );
  return category ? category.name : "所有示例";
});

const currentCategoryIcon = computed(() => {
  const category = categoriesData.find(
    (cat) => cat.id === selectedCategory.value,
  );
  return category ? category.icon : "📂";
});

const currentSubcategoryName = computed(() => {
  let subcategoryName = "所有示例";
  categoriesData.forEach((category) => {
    const subcategory = category.subcategories.find(
      (sub) => sub.id === selectedSubcategory.value,
    );
    if (subcategory) subcategoryName = subcategory.name;
  });
  return subcategoryName;
});

function getExamplesBySubcategory(subcategoryId) {
  return examplesData.value.filter((ex) => ex.category === subcategoryId);
}

function selectSubcategory(subcategory, category) {
  selectedSubcategory.value = subcategory.id;
  selectedCategory.value = category.id;

  setTimeout(() => {
    const element = document.getElementById(`subcategory-${subcategory.id}`);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function goToExample(exampleId) {
  if (examplesContainer.value) {
    sessionStorage.setItem(
      SCROLL_POS_KEY,
      examplesContainer.value.scrollTop.toString(),
    );
  }
  router.push(`/examples/openlayers/${exampleId}`);
}

function getPreviewImage(example) {
  const preview = example?.preview;
  if (preview) {
    const lookupPath = String(preview).replace(/^@\//, "../");
    if (assetPreviews[lookupPath]) return assetPreviews[lookupPath];
    return placeholder;
  }

  const dir = example.fileName.replace(/\/[^/]+$/, "");
  const prefix = `../views/${dir}/imgs/`;

  const exId = String(example.id || "");
  const preferNames = [
    `${exId}.png`,
    `${exId}.jpg`,
    `${exId}.jpeg`,
    `${exId}.webp`,
    `${exId}.svg`,
    "preview.png",
    "preview.jpg",
    "preview.jpeg",
    "preview.webp",
    "preview.svg",
  ];

  for (const name of preferNames) {
    const hit = `${prefix}${name}`;
    if (exampleImages[hit]) return exampleImages[hit];
  }

  return placeholder;
}
</script>

<style scoped>
@import "./_framework-examples.css";
</style>
