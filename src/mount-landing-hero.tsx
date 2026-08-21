import React from "react";
import ReactDOM from "react-dom/client";
import Hero26 from "@/components/originkit/hero-26";
import "@/preview-main.css";

const rootElement = document.getElementById("hero-26-mount");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Hero26 />
    </React.StrictMode>
  );
}
