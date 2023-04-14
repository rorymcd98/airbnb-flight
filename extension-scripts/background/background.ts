import { UserPreferences } from "../types-schemas/UserPreferences";
import { AirbnbListingInfo, airbnbListingInfoSchema } from "../types-schemas/ListingInfo";
import FlightApiClient from "./flight-api-client.class";
import { generateFrontendChartData, generateChartMeta, FrontendChartData, ChartMeta } from "./generate-frontend-chart";

//---Set up the Flight Api Client---
const initialUserPreferences: UserPreferences =  {
  originLocation: 'London',
  searchOutboundFlight: true,
  searchReturnFlight: true,
  travelClass: "ECONOMY",
  maxStops: 1,
  outboundTimeWindow: {
    earliestDepartureTime: 0,
    latestDepartureTime: 24,
    earliestArrivalTime: 0,
    latestArrivalTime: 24
  },
  returnTimeWindow: {
    earliestDepartureTime: 0,
    latestDepartureTime: 24,
    earliestArrivalTime: 0,
    latestArrivalTime: 24
  }
};

//Create a singleton instance of the FlightApiClient to handle all requests
const FlightApiClientInstance = FlightApiClient.getInstance(initialUserPreferences);

//---Popup script communication channel---
// background-script.js

//Set up a communication channel with the popup script (for preferences)

//---Listen to messages from the content script--
chrome.runtime.onMessage.addListener((m, _p, sendResponse) => {
  switch (m.type) {
    case "flight-price-request":
      console.log(
        "Finding flight prices to " + m.listingInfo.destinationLocation,
        m.listingInfo
      );
      handleFlightPriceRequest(m, sendResponse);

      // Return true to indicate the response will be handled asynchronously
      return true;
    default:
      console.error("Unknown message type");
      throw new Error("Unknown message type");
  }
});



async function handleFlightPriceRequest(m, sendResponse) {
  try {
    const transformedListingInfo = transformListingInfo(m.listingInfo);
    const validatedListingInfo = validateListingInfo(transformedListingInfo);

    if (!validatedListingInfo) {
      throw new Error("Invalid listing info received from content script");
    }

    const flightOffers = await FlightApiClientInstance.getFlightOffersForListing(validatedListingInfo);

    const frontendChartData = generateFrontendChartData(flightOffers.data, validatedListingInfo);
    const chartMeta = generateChartMeta(validatedListingInfo, FlightApiClientInstance.getUserPreferences());

    console.log("Returning flight prices to content script...", flightOffers.data);
    sendResponse({ type: "flight-price-response", frontendChartData, chartMeta});
  } catch (error) {
    sendResponse({
      type: "flight-price-response-error",
      message: "Error fetching flight prices",
      error,
    });
    console.error(error);
  }

  //Transforms the listing info object from the content script into a format that the FlightApiClient can use
  function transformListingInfo (listingInfo: any): AirbnbListingInfo {
   const newListingInfo = { ...listingInfo };
   
    newListingInfo.outboundDate = new Date(listingInfo.outboundDate);
    newListingInfo.returnDate = new Date(listingInfo.returnDate);

    return newListingInfo;
  }

  //Accepts a serialised listing info object and validates 
  function validateListingInfo (listingInfo: any): AirbnbListingInfo | undefined {  
    const parsedListingInfo = airbnbListingInfoSchema.safeParse(listingInfo);

    if (!parsedListingInfo.success) {
      console.error(parsedListingInfo.error);
      throw parsedListingInfo.error;
    } else {
      return parsedListingInfo.data;
    }
  }
}

//Create the initial request for user preferences

//Create an FlightApiClient singleton