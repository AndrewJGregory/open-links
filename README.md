# Open Links

This is a chrome extension I wrote to automate one trivial part of my job, automatically opening links when reviewing projects. Whenever we needed to review a project, such as a full stack web app or a JavaScript Project, we needed to read over the GitHub repo and review the live site for features and bugs. **A project page is the page where both the repo url and live link url were located.** Waiting for the project page to load, then clicking on both of these links (repo url and live site url), was starting to bother us because when reviewing 20+ projects a day, this time adds up. The goal here was to decrease the time to opening these links so we can read the todos while waiting for the other links to load.

Unfortunately, a live demo is not possible because the create function of [Chrome's tabs API](https://developer.chrome.com/extensions/tabs) is restricted to Chrome extensions with specific permissions and cannot be done from the Chrome console. Nonetheless, getting this extension to work just as I envisioned it was surprisingly difficult.

## Vision

The vision that I had was opening the links _just_ to the right of each and every project. The first solution I had was to select the links from the DOM and open them with `window.open`. This worked, but when opening a batch of project pages such as 5-10, then all the live and repo links would open to the far right instead of immediately to the right of each project. This didn't prove that useful, but it was a great start.

Next, I had to find a way to create tabs at specified places in the browser. I came across [Chrome's tabs API](https://developer.chrome.com/extensions/tabs) but soon learned that `chrome.tabs.create` is only available in [background scripts](https://developer.chrome.com/extensions/background_pages) and unavailable in [content scripts](https://developer.chrome.com/extensions/content_scripts). Content scripts are files that are executed in the context of the web page and can interact with the DOM. Background scripts are executed in the background and _cannot_ interact with the DOM, but can respond to a [message sent by a content script](https://developer.chrome.com/extensions/messaging). The difference is crucial here because the content script can select the live and repo links from the DOM but cannot create a new tab in a specified index, whereas the background script cannot select the links but can create new tabs.

The message passing is exactly what needed to be utilized in order to have the tabs opened in the background unfocused while passing the repo links to the background script to open the tabs. Ultimately, I settled on not using a content script because the content script cannot know what the current tab's index is. In order to have access to the tab index, a background script must be used while somehow executing JavaScript in the context of the page. Eventually, after much searching, I found that `chrome.tabs.executeScript` executes JavaScript in the context of the page, so selecting both the repo and live links with the corresponding tab index of the project page would be possible.

The final, simplified code is astonshingly short:

```js
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
```

This code doesn't take into account malformed URLs (empty or missing http://), but it covers the idea of how the extension itself works. Whenever a tab is updated, this script listens for that the `title` of the tab is correct and that the page is completey loaded. `Interview Database` is the title of the internal website we use to keep track of materials. When the tab has loaded, attribute selectors are used to select the links and those urls as a message to the same background script. Now, the listener for `chrome.runtime.onMessage` will be triggered, and new tabs will be _exactly_ to the right of the tab.

### Future Improvements

About ~10% of the time, the tabs won't open exactly to the right of the intended tab, but to the right of another project page. This doesn't happen that often so I haven't looked too deep into it, however I figure something is going wrong with when the callback for updating a tab is executed.

In addition, if the page is **directly** navigated to instead of opening in the background, the `onUpdated` callback is invoked too early and the urls are empty because the DOM is not completely populated yet. This is perplexing because `changeInfo.status` is `complete` but Chrome's documentation describes `changeInfo.status` only as: ["The status of the tab. Can be either loading or complete."](https://developer.chrome.com/extensions/tabs#event-onUpdated) I think this happens because the internal site we use utilizes React, and the DOM is finished loading yet the React code hasn't been injected into the page yet. A workaround for this is using `setInterval` to repeatedly query the DOM until the links appear, but this is a dirty solution and this workflow of navigating directly to a page is not our normal workflow.

The links will always open in the current focused window. This is an issue because if we open five project pages then quickly navigate to another window to do some work while the links are loading, the links will open in the current window rather than the window where the project pages are. To fix this, there is an optional `windowId` that is available as a parameter in [`chrome.tabs.create`](https://developer.chrome.com/extensions/tabs#method-create) that can be used to specify which window to open the tabs in.
