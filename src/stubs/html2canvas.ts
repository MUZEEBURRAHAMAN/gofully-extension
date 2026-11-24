// jsPDF lazy-loads html2canvas only for doc.html(), which GoFully never calls. Resolving it to this stub keeps
// unused third-party code out of the package (fewer things for Chrome Web Store review to question).
throw new Error("html2canvas is not bundled with GoFully");
