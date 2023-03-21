//---Initiate content-background script communication channel---
// content-script.js

let myPort = chrome.runtime.connect({name:"port-from-cs"});
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener((m) => {
  console.log("In content script, received message from background script: ");
  console.log(m.greeting);
});

document.body.addEventListener("click", () => {
  myPort.postMessage({greeting: "they clicked the page!"});
});

//---Add 'request-flights-button' buttons to the page---


//---Gather and send information on 'request-flights-button' button click---


//---Receive information from the background script---


//---Display flight information on the page---