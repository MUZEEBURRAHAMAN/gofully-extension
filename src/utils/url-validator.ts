export interface PageSupportResult {
  supported: boolean;
  type:
    | "supported"
    | "browser_internal"
    | "extension_page"
    | "web_store"
    | "devtools"
    | "view_source"
    | "restricted"
    | "unknown";
  title?: string;
  message?: string;
}

/**
 * Validates whether a URL can be captured by GoFully.
 * Used centrally across popup, background service-worker, and interactive modes.
 */
export function isSupportedCapturePage(url?: string | null): PageSupportResult {
  if (!url || typeof url !== "string" || url.trim() === "") {
    return {
      supported: false,
      type: "unknown",
      title: "This page can't be captured",
      message: "Chrome doesn't allow GoFully to capture this page.",
    };
  }

  const cleanUrl = url.trim().toLowerCase();

  // Chrome Web Store
  if (
    cleanUrl.startsWith("https://chromewebstore.google.com") ||
    cleanUrl.startsWith("https://chrome.google.com/webstore") ||
    cleanUrl.startsWith("http://chromewebstore.google.com") ||
    cleanUrl.startsWith("http://chrome.google.com/webstore")
  ) {
    return {
      supported: false,
      type: "web_store",
      title: "Capture isn't available here",
      message: "GoFully doesn't capture Chrome Web Store pages.",
    };
  }

  // Chrome Developer Tools
  if (cleanUrl.startsWith("devtools://")) {
    return {
      supported: false,
      type: "devtools",
      title: "Capture isn't available here",
      message: "GoFully can't capture Chrome Developer Tools.",
    };
  }

  // Browser internal pages (chrome://, edge://, brave://, opera://, about:)
  if (
    cleanUrl.startsWith("chrome://") ||
    cleanUrl.startsWith("edge://") ||
    cleanUrl.startsWith("brave://") ||
    cleanUrl.startsWith("opera://") ||
    cleanUrl.startsWith("about:") ||
    cleanUrl.startsWith("chrome-search://")
  ) {
    return {
      supported: false,
      type: "browser_internal",
      title: "Capture isn't available here",
      message: "GoFully can't capture browser-internal pages.",
    };
  }

  // Extension pages
  if (cleanUrl.startsWith("chrome-extension://") || cleanUrl.startsWith("moz-extension://")) {
    return {
      supported: false,
      type: "extension_page",
      title: "Capture isn't available here",
      message: "GoFully can't capture extension pages.",
    };
  }

  // View Source
  if (cleanUrl.startsWith("view-source:")) {
    return {
      supported: false,
      type: "view_source",
      title: "Capture isn't available here",
      message: "GoFully can't capture source-code view pages.",
    };
  }

  // Supported web protocols: http, https, file, localhost
  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("file://")
  ) {
    return {
      supported: true,
      type: "supported",
    };
  }

  // General fallback for unusual protocol schemes (data:, blob:, javascript:, etc.)
  return {
    supported: false,
    type: "restricted",
    title: "This page can't be captured",
    message: "Chrome doesn't allow GoFully to capture this page.",
  };
}
