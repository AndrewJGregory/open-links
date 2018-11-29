chrome.runtime.onMessage.addListener(request =>
  request.urls.forEach(url =>
    chrome.tabs.create({ url, active: false, index: ++request.tabIndex }),
  ),
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.title === "Jobberwocky") {
    chrome.tabs.executeScript(
      tabId,
      {
        code: `const tabIndex = ${tab.index}`,
      },
      () => {
        chrome.tabs.executeScript(tabId, {
          file: "content.js",
        });
      },
    );
  }
});
