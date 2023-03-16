import { z } from 'zod'
import { FlightSearchApi } from '../flight-search-api.class';
import { FlightSearchBody, FlightSearchBodySchema } from '../../types-schemas/FlightSearchBody'
import { AirbnbListingInfo} from '../../types-schemas/ListingInfo'
import { UserPreferences } from '../../types-schemas/UserPreferences'
import {describe, test, expect} from '@jest/globals';

describe('createFlightSearchBody', () => {
  test('should create a valid FlightSearchParam object for outbound flight only', () => {
    const userPreferences: UserPreferences =  {
      departingLocations: ['LHR'],
      searchOutboundFlight: true,
      searchReturnFlight: true,
      travelClasses: {
        ECONOMY: false,
        PREMIUM_ECONOMY: false,
        BUSINESS: false,
        FIRST: false,
      },
      maxStops: 1,
      maxPrice: 500,
      earliestDepartureTime: 6,
      latestDepartureTime: 12,
      earliestArrivalTime: 8,
      latestArrivalTime: 14,
    };

    const airbnbListingInfo: AirbnbListingInfo  ={
      destinationLocation: 'ABC123',
      arrivalDate: new Date('2023-03-16'),
      departureDate: new Date('2023-03-20'),
      guestCounter: {
        adultsCount: 2,
        childrenCount: 1,
        infantsCount: 0
      },
      currencyCode: 'USD'
    };

    const instanceOfFlightSearchApi = new FlightSearchApi(userPreferences, airbnbListingInfo);

    const flightSearchBody: FlightSearchBody = instanceOfFlightSearchApi.createFlightSearchBody();

    // Expected output:
    const expectedFlightSearchBody: FlightSearchBody = {
      currencyCode: "USD",
      originDestinations: [
        {
          id: "1",
          originLocationCode: "LAX",
          destinationLocationCode: "NYC",
          departureDateTimeRange: {
            date: "2023-03-20",
            time: "00:00:00",
          },
        },
      ],
      travelers: [
        {
          id: "1",
          travelerType: "ADULT"
        },
        {
          id: "1",
          travelerType: "CHILD"
        },
      ],
      sources: ["GDS"],
      searchCriteria: {
        maxFlightOffers: 50,
        flightFilters: {
          cabinRestrictions: [
            {
              cabin: "ECONOMY",
              coverage: "MOST_SEGMENTS",
              originDestinationIds: ["od0"],
            },
          ],
          carrierRestrictions: {
            excludedCarrierCodes: [],
          },
        },
      },
    };

    expect(flightSearchBody).toEqual(expectedFlightSearchBody);
  })
});