let activeTabId = null;
let activeDomain = null;
let startTime = null;

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await trackTime();
  const tab = await chrome.tabs.get(tabId);
  startTracking(tab);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === "complete") {
    trackTime().then(() => startTracking(tab));
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  await trackTime();
  if (windowId !== chrome.windows.WINDOW_ID_NONE) {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) startTracking(tab);
  }
});

function startTracking(tab) {
  const url = new URL(tab.url);
  activeDomain = url.hostname;
  activeTabId = tab.id;
  startTime = Date.now();
}

async function trackTime() {
  if (!activeDomain || !startTime) return;
  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
  const data = {
    domain: activeDomain,
    time: timeSpent
  };

  await fetch("http://localhost:5000/api/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  activeDomain = null;
  startTime = null;
}
