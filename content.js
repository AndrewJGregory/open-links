(() => {
  const containers = [...document.querySelectorAll("small")];
  const urls = containers.reduce((urls, container) => {
    const { href } = container.children[0];
    const isUnique = urls[0] !== href;
    if (href !== window.location.href && isUnique) urls.push(href);
    return urls;
  }, []);
  chrome.runtime.sendMessage({ urls });
})();
