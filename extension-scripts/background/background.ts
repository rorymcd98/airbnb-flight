//---Popup script communication channel---
// background-script.js

let portFromCS: chrome.runtime.Port;

function connected(p: chrome.runtime.Port) {
  portFromCS = p;
  portFromCS.postMessage({greeting: "hi there content script!"});
  portFromCS.onMessage.addListener((m) => {
    console.log("In background script, received message from content script")
    console.log(m.greeting);
  });
}

chrome.runtime.onConnect.addListener(connected);

//Set up a communication channel with the popup script (for preferences)

//Upon requests from the content script, fetch flight info from the Amadeus API



//---Content script communication channel---

//Set up a communication channel with the content script (i.e. requests for flight info)



//---Backend (API calls)---

//Create the initial request for user preferences

//Create an AmadeusFlightApiClient singleton