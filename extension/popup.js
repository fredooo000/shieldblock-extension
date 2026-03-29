const toggle = document.getElementById('blockAds');
const statusText = document.getElementById('status');
const helpBtn = document.getElementById('helpBtn');

// Load saved state
chrome.storage.local.get(['adBlockingEnabled'], (result) => {
  const enabled = result.adBlockingEnabled !== false; // default = true
  toggle.checked = enabled;
  updateStatus(enabled);
});

toggle.addEventListener('change', (e) => {
  const enabled = e.target.checked;
  
  chrome.storage.local.set({ adBlockingEnabled: enabled });
  updateStatus(enabled);

  // Update badge
  chrome.action.setBadgeText({
    text: enabled ? "ON" : "OFF"
  });
});

helpBtn.addEventListener('click', () => {
  window.open('https://discord.com/channels/@me', '_blank'); // ← Change this to your Discord server
});

function updateStatus(enabled) {
  statusText.innerHTML = enabled 
    ? 'Ad Blocker is <strong style="color:green">ACTIVE</strong>' 
    : 'Ad Blocker is <strong style="color:orange">DISABLED</strong>';
}