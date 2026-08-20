const accordions = document.querySelectorAll(".help-accordion");

accordions.forEach((acc) => {
  const header = acc.querySelector(".help-header");
  header?.addEventListener("click", () => {
    const isOpen = acc.classList.contains("open");
    
    // Close other accordions for clean focus (accordion mode)
    accordions.forEach((other) => {
      if (other !== acc) {
        other.classList.remove("open");
        const otherHeader = other.querySelector(".help-header");
        if (otherHeader) otherHeader.setAttribute("aria-expanded", "false");
      }
    });

    if (isOpen) {
      acc.classList.remove("open");
      header.setAttribute("aria-expanded", "false");
    } else {
      acc.classList.add("open");
      header.setAttribute("aria-expanded", "true");
    }
  });
});

// Setup quick shortcut links
document.getElementById("openShortcutsBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
});
