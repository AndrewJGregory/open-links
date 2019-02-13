chrome.runtime.onMessage.addListener(request => {
  request.urls.forEach(url =>
    chrome.tabs.create({ url, active: false, index: ++request.tabIndex }),
  );
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.title === "Interview Database") {
    chrome.tabs.executeScript(tabId, {
      code: `
      (() => {
        const urls = [document.querySelector('[id*=RepoUrl]').value, document.querySelector('[id*=LiveUrl]').value];
        chrome.runtime.sendMessage({urls, tabIndex: ${tab.index}})
      })();`,
    });
  }
});
