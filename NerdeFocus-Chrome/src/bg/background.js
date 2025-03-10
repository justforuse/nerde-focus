// Service worker for Manifest V3
// This replaces the background.html page from V2

// Connection handler for devtools panel
chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener = function (message, sender) {
        if (message.tabId && message.content) {
            if (message.action === 'code') {
                // Execute script in inspected page
                chrome.scripting.executeScript({
                    target: { tabId: message.tabId },
                    func: (code) => {
                        // Wrap in a function to avoid direct eval
                        return new Function(code)();
                    },
                    args: [message.content]
                });
            } else if (message.action === 'script') {
                // Attach script to inspected page
                chrome.scripting.executeScript({
                    target: { tabId: message.tabId },
                    files: [message.content]
                });
            } else {
                // Pass message to inspected page
                chrome.tabs.sendMessage(message.tabId, message);
            }
        } else {
            // Pass messages from inspected page to the panel
            port.postMessage({content: message, sender: sender});
        }
    };

    // Listen for messages from the panel
    chrome.runtime.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function () {
        chrome.runtime.onMessage.removeListener(extensionListener);
    });
});

// Simple listener to keep service worker active
chrome.runtime.onMessage.addListener(function (request, sender) {
    return true;
});
