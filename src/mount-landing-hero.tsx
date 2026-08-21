import React from "react";
import ReactDOM from "react-dom/client";
import Hero26 from "@/components/originkit/hero-26";
import "@/preview-main.css";

function mountHero() {
  const rootElement = document.getElementById("hero-26-mount");
  if (rootElement && !rootElement.getAttribute("data-mounted")) {
    rootElement.setAttribute("data-mounted", "true");
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <Hero26 />
      </React.StrictMode>
    );
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountHero);
} else {
  mountHero();
}

setTimeout(mountHero, 100);
setTimeout(mountHero, 500);
