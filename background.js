chrome.runtime.onMessage.addListener(request =>
  request.urls.forEach(url =>
    chrome.tabs.create({ url, active: false, index: ++request.tabIndex }),
  ),
);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.title === "Jobberwocky") {
    chrome.tabs.executeScript(tabId, {
      code: `
      (() => {
      const tabIndex = ${tab.index};
      const containers = [...document.querySelectorAll("small")];
      const urls = containers.reduce((urls, container) => {
        const { href } = container.children[0];
        const isUnique = urls[0] !== href;
        if (href !== window.location.href && isUnique) urls.push(href);
        return urls;
      }, []);
      chrome.runtime.sendMessage({ urls, tabIndex });
    })()`,
    });
  }
});
