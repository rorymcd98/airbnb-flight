import React from "react";
import { createRoot } from 'react-dom/client';

// console.log('1h23i123')
// document.addEventListener("DOMContentLoaded", (event) => {
// //---Initiate content-background script communication channel---
// // content-script.js


let myPort = chrome.runtime.connect({name:"port-from-cs"});
myPort.postMessage({greeting: "hello from content script"});

myPort.onMessage.addListener((m) => {
  console.log("In content script, received message from background script: ");
  console.log(m.greeting);
});


//---Add 'request-flights-button' buttons to the page---



// const reactComponent = React.createElement('div');

function ReactComponent({idNumber}) {
  return (
    <div id={"MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM" + idNumber.toString()}>vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv</div>
  )
}

//---Grab all the listings on a page and iterate to generate listing information for each---

//---Render the 'request-flights-button' button on each listing div---
function renderRequestFlightsButton(listingDivs) {
  let c = 0;
  listingDivs.forEach((listingDiv) => {
    const test = document.createElement('div');
    test.id = 'test' + c;
    console.log(c)
    listingDiv.appendChild(test);
    createRoot(listingDiv).render(<ReactComponent idNumber={c}/>);
    console.log(c);
    c++;
  });
}






const configForListings = { attributes: true, childList: true, subtree: false };

const callbackForListings = function(mutationsList) {
  console.log('Here: ')
  console.log(mutationsList)
  for(let mutation of mutationsList) {
     console.log('Here2: ');
     console.log(mutation)
  }
};


// Options for the observer (which mutations to observe)
const configForContainer = { attributes: true, childList: true, subtree: true };

var observerFindListings = new MutationObserver(callbackForListings);

function initObserveListings(containerNode) {
  console.log('initObserverListings called')


  setTimeout(()=>(console.log(containerNode)), 3000);

  observerFindListings.observe(containerNode, configForListings);
}

// Callback function to execute when mutations are observed
const callbackFindListingsContainer = function(mutationsList) {
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const x = Array.isArray(mutation.addedNodes) ? mutation.addedNodes : [mutation.addedNodes]; 
            x.forEach(newNode => {
                if (newNode.classList && newNode.classList.contains('gh7uyir')) {
                    // Execute your desired action when the node is found
                    console.log('Node with class "gh7uyir" has been added:', newNode);
                    
                    //renderRequestFlightsButton(newNode.children);
                    observerFindListingsContainer.disconnect();
                    initObserveListings(newNode);

                }
            });
        }
    }
};

// Create an observer instance linked to the callback function
const observerFindListingsContainer = new MutationObserver(callbackFindListingsContainer);



function findContainer (){
  const container = document.querySelector('.gh7uyir');
  if (container) {
    console.log("Didn't need to observe")

    initObserveListings(container);
  } else {
    console.log("Need to observe")
    // Start observing the target node for configured mutations
    console.log(document)
    observerFindListingsContainer.observe(document, configForContainer);
  }

  console.log('something should have happened')
}

setTimeout(findContainer, 3000);
// findContainer();





//---Send listing information on 'request-flights-button' button click---


//---Receive information from the background script---


//---Display flight information on the page---

//});