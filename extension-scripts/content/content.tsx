import React from "react";
import { createRoot } from 'react-dom/client';
import { AirbnbListingInfo, airbnbListingInfoSchema, GuestCounter} from "../types-schemas/ListingInfo";
import { FrontendChartData, ChartMeta } from "../background/generate-frontend-chart";
import FlightOffersChart from "../../extension-frontend/flight-offers-chart/components/FlightOffersChart";
import { deserialize } from "v8";


//---Add 'FlightPriceRequestButton' buttons to the page---
//React component for the FlightPriceRequestButton
type FlightPriceRequestProps = {
  idNumber: string;
  flightPriceRequestOnClick: (e: Event) => void;
};
function FlightPriceRequest({idNumber, flightPriceRequestOnClick }: FlightPriceRequestProps) {
  return (
    <span 
      key={idNumber}
      className = {'FlightPriceRequestContainer'}
    >
      <button
        className="FlightPriceRequestButton"
        onClick={flightPriceRequestOnClick}
        style={{position: 'relative', zIndex: 2}}
      >Flights</button>
    </span>
  )
}

//---Grab all the listings on a page and iterate to generate listing information for each---
function findAllListingElements(): HTMLCollectionOf<Element> {
  const listingClassName = 'c4mnd7m';
  return document.getElementsByClassName(listingClassName);
}

//---Render the 'request-flights-button' button on each listing div---
function renderFlightPriceRequestComponent(listingElements: HTMLCollectionOf<Element>) {
  for (let i = 0; i < listingElements.length; i++) {
    const curListing = listingElements[i] as HTMLDivElement;

    if (checkAlreadyHasComponent(curListing)) {continue}

    const extensionListingId = getListingId(curListing);
    const priceContainer = getPriceContainer(curListing);

    if (!priceContainer || !extensionListingId) {continue}

    const attachmentPoint = document.createElement('span');
    attachmentPoint.id = 'request-flights-' + extensionListingId;
    priceContainer.appendChild(attachmentPoint);

    const flightPriceOnClick = generateFlightPriceOnClick(extensionListingId, curListing);

    createRoot(attachmentPoint).render(<FlightPriceRequest idNumber={extensionListingId} flightPriceRequestOnClick={flightPriceOnClick}/>);
  }

  
  function generateFlightPriceOnClick (idNumber: string, listingElement: HTMLElement): (e: Event) => void {
    return async function(e) {
      e.stopPropagation();

      //Extract as much listing info as possible from the the href
      const partialListingInfo = extractBookingDetails(listingElement) as Partial<AirbnbListingInfo>;

      const currencyCode = getCurrencyCodeFromPage();

      //Extract the destinationLocation (address) from the listing div
      const destinationLocationSelector = '#title_' + idNumber;
      const destinationLocation = listingElement.querySelector(destinationLocationSelector)?.textContent?.trim();

      if (!destinationLocation) { throw new Error('Could not find destination location');}

      const listingInfo: AirbnbListingInfo = {
        ...partialListingInfo,
        currencyCode,
        destinationLocation
      }

      callBackgroundFlightApi(idNumber, listingInfo);
    };

  //Extract booking details from the URL of the listingElement
  function extractBookingDetails(listingElement: HTMLElement): {guestCounter: GuestCounter, outboundDate: Date, returnDate: Date} {
    const selectorForListingUrl = 'div.c1l1h97y.dir.dir-ltr > div > div > div > div.cy5jw6o.dir.dir-ltr > a'

    const href = listingElement.querySelector(selectorForListingUrl)?.getAttribute('href');
    //E.g. href="/rooms/42850678?adults=1&amp;category_tag=Tag%3A8225&amp;children=1&amp;enable_m3_private_room=false&amp;infants=1&amp;pets=0&amp;search_mode=flex_destinations_search&amp;check_in=2023-12-19&amp;check_out=2023-12-23&amp;previous_page_section_name=1000&amp;federated_search_id=0c937c85-f380-4c0e-a3b3-3441fb5c745e"

    if (href == null) { throw new Error('Could not find listing URL');}

    const urlParams = new URLSearchParams(href.substring(href.indexOf('?')));

    const guestCounter: GuestCounter = {
      //If the number of adults is not specified or 0, default to 1
      adultsCount: Number(urlParams.get('adults')) || 1,
      childrenCount: Number(urlParams.get('children')),
      infantsCount: Number(urlParams.get('infants')),
    }

    const checkIn = urlParams.get('check_in');
    const checkOut = urlParams.get('check_out');

    if (checkOut == null || checkIn == null) { throw new Error('Could not find check in or check out dates');}

    return {
      guestCounter,
      outboundDate: new Date(checkIn),
      returnDate: new Date(checkOut)
    };
  }

  function getCurrencyCodeFromPage(): string {
    const currencySelector = 'span:nth-child(2) > button > span._144l3kj';
    const currencyCode = document.querySelector(currencySelector)?.textContent?.trim();
    console.log(currencyCode)
    
    if (!currencyCode) { console.warn('Could not find currency code, resorting to USD');}

    return currencyCode ?? 'USD';
  }
  };

  function checkAlreadyHasComponent(listingElement : HTMLDivElement): boolean {
    const existingComponent = listingElement.getElementsByClassName('FlightPriceRequestContainer')[0];
    return !!existingComponent;
  }

  function getListingId(listingElement : HTMLDivElement): string | undefined {
    const listingUrlMetaTag = listingElement.querySelector('meta[itemprop="url"]');

    if (!listingUrlMetaTag) {return undefined;}

    const listingUrl = listingUrlMetaTag.getAttribute('content');

    if (!listingUrl) {return undefined;}

    //The first 8 characters of the URL are the listing ID (sometimes 7 + ?)
    //(dev) replace with a more reliable method
    const listingMatch = listingUrl.match(/\/rooms\/(\d+)\?/);
    
    if (!listingMatch) {return undefined;}
    const listingId = listingMatch[1];

    return listingId;
  }

  function getPriceContainer(listingElement : HTMLDivElement): HTMLDivElement | undefined {
    const listingPriceClassName = '_i5duul';
    const priceContainer = listingElement.getElementsByClassName(listingPriceClassName)[0];
    
    if (!priceContainer) {return undefined;}

    return priceContainer as HTMLDivElement;
  }
};

function initRenderingLoop() {
  const listingElements = findAllListingElements();
  if (listingElements.length > 0) {
    renderFlightPriceRequestComponent(listingElements);
  }
  setTimeout(initRenderingLoop, 1000);
}

initRenderingLoop();

//---Send listing information on 'request-flights-button' button click---
function callBackgroundFlightApi(idNumber: string, listingInfo: AirbnbListingInfo): void {
  const parsedListingInfo = airbnbListingInfoSchema.safeParse(listingInfo);

  if (!parsedListingInfo.success) {
    console.error(listingInfo);
    throw new Error('Could not validate listing info.');
  }

  type FlightPriceRequest = {
    type: 'flight-price-request';
    id: string;
    listingInfo: AirbnbListingInfo;
  }
  const flightPriceRequestMessage: FlightPriceRequest = {
    type: 'flight-price-request',
    id: idNumber,
    listingInfo: parsedListingInfo.data
  }

  chrome.runtime.sendMessage(flightPriceRequestMessage, async function(response) {
    if (response.type === 'flight-price-response') {

        console.log('I have been called function callBackgroundFlightApi')
        //const deserialisedFlightOffersData = deserialisedFlightOffersData(response.flightOffersData);
        renderChartOnPage(response.flightOffersData, response.chartMeta);
    } else {
      console.error("Error from background script: ", response.message, response.error);
    }
  });  
}

//---Receive information from the background script---


//---Display flight information on the page---
function renderChartOnPage(frontendChartData: FrontendChartData, chartMeta: ChartMeta): void {
  console.log('I have been called function renderChartOnPage')
  
  const chartContainer = document.createElement('div');
  chartContainer.id = 'flight-chart-container';
  chartContainer.className = 'absolute top-0 left-0 w-full h-full z-50';

  createRoot(chartContainer).render(<FlightOffersChart flightOffersData={frontendChartData} chartMeta={chartMeta}/>)
}

function removeChartFromPage(): void {
  const chartContainer = document.getElementById('flight-chart-container');
  if (chartContainer) {
    chartContainer.remove();
  }
}