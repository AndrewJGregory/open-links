(() => {
  const containers = [...document.querySelectorAll('small')];
  const urls = containers.reduce((urls, container) => {
    const { href } = container.children[0];
    if (href !== window.location.href) urls.push(href);
    return urls;
  }, [])
  chrome.runtime.sendMessage({ urls });
})();