import { createApp } from "vue";
import "./style.css";
import "./styles/global.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import { syncMapTokens } from "./utils/mapTokens";

syncMapTokens();

const app = createApp(App);
app.use(ElementPlus);
app.use(router);
app.mount("#app");
