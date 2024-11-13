chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processLinks') {
    const classifiedLinks = message.links.map(link => ({
      url: link,
      type: classifyLink(link),
    }));
    sendResponse({ classifiedLinks });
  }
});
