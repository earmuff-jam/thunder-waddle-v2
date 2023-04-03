try {
  chrome.devtools.panels.create(
    "Dev Tools",
    "sm.png",
    "src/pages/panel/index.html"
  );
} catch (e) {
  console.error(e);
}
