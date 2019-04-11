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
        const formatUrl = url => {
          if (url.slice(0, 4) !== "http") url = "http://" + url;
          return url
        }
        const repoUrl = formatUrl(document.querySelector('[id*=RepoUrl]').value);
        const liveUrl = formatUrl(document.querySelector('[id*=LiveUrl]').value);
        const urls = [repoUrl, liveUrl].filter(url => url);        
        chrome.runtime.sendMessage({urls, tabIndex: ${tab.index}})
      })();`,
    });
  }
});
