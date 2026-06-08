import { leafletCategories, leafletExamples } from "./leafletExamplesData";
import { openLayersCategories, openLayersExamples } from "./openLayersExamplesData";

function withComputedCounts(categories, examples) {
  const subCountMap = new Map();
  examples.forEach((ex) => {
    subCountMap.set(ex.category, (subCountMap.get(ex.category) || 0) + 1);
  });

  return categories.map((cat) => {
    const subcategories = (cat.subcategories || []).map((sub) => ({
      ...sub,
      count: subCountMap.get(sub.id) || 0,
    }));

    const count = subcategories.reduce((sum, s) => sum + (s.count || 0), 0);
    return { ...cat, count, subcategories };
  });
}

export function getFrameworkCatalog(engine) {
  if (engine === "leaflet") {
    return {
      categories: withComputedCounts(leafletCategories, leafletExamples),
      examples: leafletExamples,
    };
  }
  if (engine === "openlayers") {
    return {
      categories: withComputedCounts(openLayersCategories, openLayersExamples),
      examples: openLayersExamples,
    };
  }
  return { categories: [], examples: [] };
}

export function getFrameworkExampleById(engine, exampleId) {
  const { examples } = getFrameworkCatalog(engine);
  return examples.find((ex) => ex.id === exampleId) || null;
}
