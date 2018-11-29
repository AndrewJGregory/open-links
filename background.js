chrome.runtime.onMessage.addListener(request =>
  request.urls.forEach(url => chrome.tabs.create({ url, active: false })),
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.title === "Jobberwocky") {
    chrome.tabs.executeScript(tabId, {
      file: "content.js",
    });
  }
});
