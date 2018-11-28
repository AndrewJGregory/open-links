(() => {
  const containers = [...document.querySelectorAll('small')];
  const urls = containers.map(container => container.children[0].href)
  chrome.runtime.sendMessage({ urls });
})();