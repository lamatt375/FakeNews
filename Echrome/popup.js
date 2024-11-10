const toggleButton = document.getElementById("toggleButton");

// Check storage for current state
chrome.storage.local.get("highlightEnabled", (data) => {
  const isEnabled = data.highlightEnabled || false;
  console.log("Initial highlight state:", isEnabled);
  toggleButton.textContent = isEnabled ? "Turn Off" : "Turn On";
});

// Toggle the highlighting state
toggleButton.addEventListener("click", () => {
    console.log("Toggle button clicked.");  // Check if this log appears
    chrome.storage.local.get("highlightEnabled", (data) => {
      const isEnabled = !data.highlightEnabled;
      console.log("New highlight state:", isEnabled);
  
      chrome.storage.local.set({ highlightEnabled: isEnabled }, () => {
        console.log("Highlight state saved to storage:", isEnabled);
        toggleButton.textContent = isEnabled ? "Turn Off" : "Turn On";
  
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            console.log("Active tab found:", tabs[0].url);
  
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              function: toggleHighlighting,
              args: [isEnabled]
            }).then(() => {
              console.log("Script executed successfully on active tab.");
            }).catch((error) => {
              console.error("Script injection failed:", error);
            });
          } else {
            console.error("No active tab found.");
          }
        });
      });
    });
  });
  

// Function to enable or disable highlighting on the page
function toggleHighlighting(enabled) {
  console.log("toggleHighlighting function called with enabled:", enabled);

  if (enabled) {
    console.log("Highlighting enabled. Calling traverseAndHighlight...");
    traverseAndHighlight(document.body);
  } else {
    console.log("Highlighting disabled. Reloading page to remove highlights.");
    location.reload(); // Reloads the page to remove highlights
  }
}
