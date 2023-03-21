(async () => {
  const src = chrome.extension.getURL('./extension-scripts/content/content_main.js');
  const contentScript = await import(src);
  contentScript.main(/* chrome: no need to pass it */);
})();

