chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

    try {
        await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    } catch {
        // Content script not yet injected on this tab — inject it first
        await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['src/content.js'] });
        await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['public/content.css'] });
        chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    }
});
