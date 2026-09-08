import { applyTheme, watchTheme } from "../utils/theme";

applyTheme();
watchTheme();

document.getElementById("getStartedBtn")?.addEventListener("click", () => {
  window.close();
});
