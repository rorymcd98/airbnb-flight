import { FlightOffer, generateFrontendOffersData } from '../find-cheapest-flights';
import {describe, test, expect} from '@jest/globals';
import { AirbnbListingInfo } from '../../types-schemas/ListingInfo';

// var flightOffers: FlightOffer[] = await fetch('./find-cheapest-flight.test.json').then((response) => response.json());

import flightOffersJson from './find-cheapest-flight.test.json';

const flightOffers: FlightOffer[] = flightOffersJson as FlightOffer[];

const listingInfo: AirbnbListingInfo = {
  destinationLocation: 'London, United Kingdom',
  outboundDate: new Date('2023-04-13'),
  returnDate: new Date('2023-04-16'),
  guestCounter: {
    adultsCount: 2,
    childrenCount: 0,
    infantsCount: 0,
  },
  currencyCode: 'GBP'
};


describe('findCheapestFlights', () => {
  // test('should return the cheapest flights for each departure date', () => {


  //   const cheapestFlights = generateFrontendOffersData(flightOffers, listingInfo);

  //   console.log(flightOffers[0])

  //   console.log(cheapestFlights)


  // });

  test('should return empty objects when no flights are found (0 FlightOffers)', () => {
    const flightOffers: FlightOffer[] = [];
    const cheapestFlights = generateFrontendOffersData(flightOffers, listingInfo);

    expect(cheapestFlights.cheapestFlightsAnyDuration).toEqual({});
    expect(cheapestFlights.cheapestFlightsTripDuration).toEqual({});
    expect(cheapestFlights.cheapestFlightOutboundReturn).toEqual({});
  });
});