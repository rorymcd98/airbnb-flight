

import { FlightDate } from '../types-schemas/FlightDate';
import { AirbnbListingInfo } from '../types-schemas/ListingInfo';
import { FlightOffer } from '../types-schemas/FlightOffersResponse';
import { UserPreferences } from '../types-schemas/UserPreferences';

export type FrontendChartData = {
  cheapestFlightsTripDuration: Record<FlightDate, (CheapestFlight | null )>;
  cheapestFlightsAnyDuration: Record<FlightDate, (CheapestFlight | null )>;
  cheapestFlightOutboundReturn: Record<FlightDate, Record<FlightDate, (CheapestFlight | null)>>;
}

export type CheapestFlight = {
  outboundDate: FlightDate;
  outboundTime: string;
  returnDate: FlightDate| null;
  returnTime: string | null;
  flightPrice: number;
  carrier: string| null | undefined;
};

export type ChartMeta = {
  currency: string;
  originLocation: string;
  destinationLocation: string;
  tripDuration: number;
}

export function generateChartMeta(listingInfo: AirbnbListingInfo, userPreferences: UserPreferences): ChartMeta {  
  return {
      currency: listingInfo.currencyCode,
      originLocation: userPreferences.originLocation,
      destinationLocation: listingInfo.destinationLocation,
      tripDuration: findTripDuration_Days(listingInfo)
    }
}

export function generateFrontendChartData(flightOffers: FlightOffer[], listingInfo: AirbnbListingInfo): FrontendChartData {
  const cheapestFlights: FrontendChartData = {
    cheapestFlightsTripDuration: {},
    cheapestFlightsAnyDuration: {},
    cheapestFlightOutboundReturn: {}
  };

  if (flightOffers.length === 0) {
    return cheapestFlights;
  }

  const earliestDate = findEarliestOutboundDate(flightOffers);
  const latestDate = findLatestOutboundDate(flightOffers);

  const outboundDates = generateDatesRange(earliestDate, latestDate);
  const tripDuration_Days = findTripDuration_Days(listingInfo);
  

  //Populate cheapestFlightsTripDuration
  outboundDates.forEach((outboundDate) => {
    //Find the flight offers on a date, and filter them by the trip duration
    const outboundFlightOffers = filterByDate(flightOffers, outboundDate, true);
    const returnDateAfterTripDuration = generateDateAfterDifference(outboundDate, tripDuration_Days);
    const returnDateString = returnDateAfterTripDuration.toISOString().split('T')[0];

    //Find the cheapest flight offer matching outbound and return dates
    const returnFlightOffers = filterByDate(outboundFlightOffers, returnDateString, false);
    const cheapestReturnFlight = findCheapestOfArray(returnFlightOffers);

    if (cheapestReturnFlight) {
      cheapestFlights.cheapestFlightsTripDuration[outboundDate] = cheapestReturnFlight;
    } else {
      cheapestFlights.cheapestFlightsTripDuration[outboundDate] = null;
    }
  });

  //Populate cheapestFlightsAnyDuration
  outboundDates.forEach((outboundDate) => {
    const outboundFlightOffers = filterByDate(flightOffers, outboundDate, true);
    const cheapestReturnFlight = findCheapestOfArray(outboundFlightOffers);

    if (cheapestReturnFlight) {
      cheapestFlights.cheapestFlightsAnyDuration[outboundDate] = cheapestReturnFlight;
    } else {
      cheapestFlights.cheapestFlightsAnyDuration[outboundDate] = null;
    }
  });

  const latestReturnDate = findLatestReturnDate(flightOffers);
  const returnDates = generateDatesRange(earliestDate, latestReturnDate);

  //Populate cheapestFlightOutboundReturn
  outboundDates.forEach((outboundDate) => {
    cheapestFlights.cheapestFlightOutboundReturn[outboundDate] = {};

    //Iterate over the range of possible return dates and find the cheapest for each filtered subset
    returnDates.forEach((returnDate) => {
      const outboundFlightOffers = filterByDate(flightOffers, outboundDate, true);
      const returnFlightOffers = filterByDate(outboundFlightOffers, returnDate, false);
      const cheapestReturnFlight = findCheapestOfArray(returnFlightOffers);

      if (cheapestReturnFlight) {
        cheapestFlights.cheapestFlightOutboundReturn[outboundDate][returnDate] = cheapestReturnFlight;
      } else {
        cheapestFlights.cheapestFlightOutboundReturn[outboundDate][returnDate] = null;
      }
    });
  });

  return cheapestFlights;
}

function convertOfferToCheapestFlight(flightOffer: FlightOffer): (CheapestFlight| null) {

  const outboundArray = flightOffer?.itineraries?.[0]?.segments?.[0]?.departure?.at?.split('T') || [];
  const returnArray = flightOffer?.itineraries?.[1]?.segments?.[0]?.departure?.at?.split('T') || [];
  
  const flightPrice = flightOffer?.price?.total;
  const carrier = flightOffer?.itineraries?.[0]?.segments?.[0]?.carrierCode;
  
  if (!flightPrice || !outboundArray) return null;

  const intFlightPrice = parseInt(flightPrice);

  return {
    outboundDate: outboundArray[0],
    outboundTime: formatTime(outboundArray[1]) as string,
    returnDate: returnArray[0],
    returnTime: formatTime(returnArray[1]),
    flightPrice: intFlightPrice,
    carrier
  }

  function formatTime(timeString: string): (string | null) {
    if (!timeString) return null;
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }
};

function generateDateAfterDifference(dateString: string, daysDifference: number): Date {
  const newDate = new Date(dateString);
  newDate.setDate(newDate.getDate() + daysDifference);
  return newDate;
}

function findTripDuration_Days(listingInfo: AirbnbListingInfo): number {
  const outboundDate = listingInfo.outboundDate;
  const returnDate = listingInfo.returnDate;

  const tripDuration_ms = returnDate.getTime() - outboundDate.getTime();
  const tripDuration_Days = Math.floor(tripDuration_ms / (1000 * 3600 * 24));

  return tripDuration_Days;
}

function generateDatesRange(startDate: FlightDate, endDate: FlightDate): FlightDate[] {
  const datesRange = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  while (start <= end) {
    datesRange.push(new Date(start).toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }

  return datesRange;
}

//Utility function for getting our extrema dates
function findDate(flightOffers: FlightOffer[], itineraryIndex: number, comparator: (a: FlightDate, b: FlightDate) => boolean): FlightDate {
  let resultDate = flightOffers?.[0]?.itineraries?.[itineraryIndex]?.segments?.[0]?.departure?.at?.split('T')?.[0] as FlightDate;

  flightOffers.forEach((flightOffer) => {
    const flightOfferDate = flightOffer?.itineraries?.[itineraryIndex]?.segments?.[0]?.departure?.at?.split('T')?.[0];

    if (typeof flightOfferDate == 'string' && comparator(flightOfferDate, resultDate)) {
      resultDate = flightOfferDate;
    }
  });

  return resultDate;
}

function findEarliestOutboundDate(flightOffers: FlightOffer[]): FlightDate {
  return findDate(flightOffers, 0, (a, b) => a < b);
}

function findLatestOutboundDate(flightOffers: FlightOffer[]): FlightDate {
  return findDate(flightOffers, 0, (a, b) => a > b);
}

function findLatestReturnDate(flightOffers: FlightOffer[]): FlightDate {
  return findDate(flightOffers, 1, (a, b) => a > b);
}


function findCheapestOfArray(flightOffers: FlightOffer[]): CheapestFlight | null {
  if (flightOffers.length === 0) {
    return null;
  }

  let cheapestFlightOffer = flightOffers[0];

  flightOffers.forEach((flightOffer) => {
    if (parseFloat(flightOffer.price!.total!) < parseFloat(cheapestFlightOffer.price!.total!)) {
      cheapestFlightOffer = flightOffer;
    }
  });

  const cheapestFlight = convertOfferToCheapestFlight(cheapestFlightOffer);

  return cheapestFlight;
}

function filterByDate(flightOffers: FlightOffer[], flightDateFilter: string, filterOutboundOrReturn: boolean): FlightOffer[] {  
  const outboundOrReturn = filterOutboundOrReturn ? 0 : 1;
  
  const filteredFlights = flightOffers.filter((flightOffer) => {
    const flightOfferDate = flightOffer?.itineraries?.[outboundOrReturn]?.segments?.[0]?.departure?.at?.split('T')[0];
    return flightOfferDate === flightDateFilter;
  });

  return filteredFlights;
}