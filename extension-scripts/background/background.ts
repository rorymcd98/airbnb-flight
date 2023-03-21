//---Popup script communication channel---
// background-script.js

let portFromCS;

function connected(p) {
  portFromCS = p;
  portFromCS.postMessage({greeting: "hi there content script!"});
  portFromCS.onMessage.addListener((m) => {
    console.log("In background script, received message from content script")
    console.log(m.greeting);
  });
}

browser.runtime.onConnect.addListener(connected);

browser.browserAction.onClicked.addListener(() => {
  portFromCS.postMessage({greeting: "they clicked the button!"});
});

//Set up a communication channel with the popup script (for preferences)

//Upon requests from the content script, fetch flight info from the Amadeus API



//---Content script communication channel---

//Set up a communication channel with the content script (i.e. requests for flight info)



//---Backend (API calls)---

//Create the initial request for user preferences

//Create an AmadeusFlightApiClient singleton