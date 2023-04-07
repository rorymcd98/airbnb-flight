import { FlightOffer, generateFrontendOffersData } from '../generate-frontend-chart';
import {describe, test, expect} from '@jest/globals';
import { AirbnbListingInfo } from '../../types-schemas/ListingInfo';


// Test case data
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

// Expected test case result
import expectedFrontendOffersData from './frontendOffersData.test.json';


describe('generateFrontendOffersData', () => {
  test('Should continue to generate the developer validated frontendOffersData', () => {

    const frontendOffersData = generateFrontendOffersData(flightOffers, listingInfo);
    
    expect(frontendOffersData).toEqual(expectedFrontendOffersData);
  });

  test('should return empty objects when no flights are found (0 FlightOffers)', () => {
    const flightOffers: FlightOffer[] = [];
    const frontendOffersData = generateFrontendOffersData(flightOffers, listingInfo);

    expect(frontendOffersData.cheapestFlightsAnyDuration).toEqual({});
    expect(frontendOffersData.cheapestFlightsTripDuration).toEqual({});
    expect(frontendOffersData.cheapestFlightOutboundReturn).toEqual({});
  });
});