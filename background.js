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
        const sendMessage = containers => {
          const tabIndex = ${tab.index};
          const urls = containers.reduce((urls, container) => {
            const { href } = container.children[0];
            const isUnique = urls[0] !== href;
            if (href !== window.location.href && isUnique) urls.push(href);
            return urls;
          }, []);
          chrome.runtime.sendMessage({ urls, tabIndex });
        }
        
        let containers = [...document.querySelectorAll("small")];
        if (!containers.length) {
          const id = setInterval(() => {
            containers = [...document.querySelectorAll("small")];
            if (containers.length) {
              clearInterval(id);
              sendMessage(containers);
            }
          }, 200);
        } else {
          sendMessage(containers)
        }
      })();`
    });
  }
});
