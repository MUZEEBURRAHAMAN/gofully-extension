import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import Hero01 from "@/components/originkit/hero-01";
import Hero26 from "@/components/originkit/hero-26";
import "./preview-main.css";

function App() {
  const [activeHero, setActiveHero] = useState<"hero-01" | "hero-26">("hero-26");

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 p-1.5 shadow-lg backdrop-blur-md">
        <button
          onClick={() => setActiveHero("hero-01")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeHero === "hero-01"
              ? "bg-black text-white shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Hero 01
        </button>
        <button
          onClick={() => setActiveHero("hero-26")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activeHero === "hero-26"
              ? "bg-black text-white shadow-sm"
              : "text-gray-600 hover:text-black"
          }`}
        >
          Hero 26 (DotMatrix)
        </button>
      </div>

      {activeHero === "hero-01" ? <Hero01 /> : <Hero26 />}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
