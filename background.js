chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openLinks') {
    const urls = request.urls;
    
    urls.forEach((url, index) => {
      setTimeout(() => {
        chrome.tabs.create({
          url: url,
          active: false,
          index: sender.tab.index + index + 1
        });
      }, index * 50);
    });
    
    sendResponse({ status: 'success' });
  }
});