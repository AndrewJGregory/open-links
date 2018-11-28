chrome.runtime.onMessage.addListener(
  request => request.urls.forEach(url => chrome.tabs.create({ url, active: false }))
);