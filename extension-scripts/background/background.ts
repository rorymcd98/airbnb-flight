import { UserPreferences } from "../types-schemas/UserPreferences";
import { AirbnbListingInfo, airbnbListingInfoSchema } from "../types-schemas/ListingInfo";
import FlightApiClient from "./flight-api-client.class";

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
    const validatedListingInfo = validateListingInfo(m.listingInfo);

    if (!validatedListingInfo) {
      throw new Error("Invalid listing info received from content script");
    }

    const res = await FlightApiClientInstance.getFlightOffersForListing(
      validatedListingInfo
    );

    console.log("Returning flight prices to content script...", res.data);
    sendResponse({ type: "flight-price-response", flightOffers: res.data.data });
  } catch (error) {
    sendResponse({
      type: "flight-price-response-error",
      message: "Error fetching flight prices",
      error,
    });
    console.error(error);
  }

  function validateListingInfo (listingInfo: any): AirbnbListingInfo | undefined {
    listingInfo.outboundDate = new Date(listingInfo.outboundDate);
    listingInfo.returnDate = new Date(listingInfo.returnDate);
    
    const parsedListingInfo = airbnbListingInfoSchema.safeParse(listingInfo);

    if (!parsedListingInfo.success) {
      console.error(parsedListingInfo.error);
      throw parsedListingInfo.error;
    } else {
      return parsedListingInfo.data;
    }
  }
}



//Upon requests from the content script, fetch flight info from the Amadeus API

//---Backend (API calls)---

//Create the initial request for user preferences

//Create an FlightApiClient singleton