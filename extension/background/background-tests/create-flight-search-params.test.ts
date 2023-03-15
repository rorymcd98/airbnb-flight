import { z } from 'zod'
import { createFlightSearchBody } from '../create-flight-search-body';
import { FlightSearchBody, FlightSearchBodySchema } from '../../types-schemas/FlightSearchBody'
import { AirbnbListingInfo} from '../../types-schemas/ListingInfo'
import { UserPreferences } from '../../types-schemas/UserPreferences'
import {describe, test, expect} from '@jest/globals';

describe('createFlightSearchBody', () => {
  test('should create a valid FlightSearchParam object for outbound flight only', () => {
    const userPreferences: UserPreferences = {
      departingLocations: ["LAX"],
      searchOutboundFlight: true,
      searchReturnFlight: false,
      travelClass: ["ECONOMY"],
      airlineWhiteList: [],
      airlineBlackList: [],
      maxStops: 1,
      maxPrice: 500,
      earliestDepartureTime: 0,
      latestDepartureTime: 24,
      earliestArrivalTime: 0,
      latestArrivalTime: 24,
    };

    const listingInfo: IAirbnbListingInfo = {
      destinationLocation: "NYC",
      arrivalDate: new Date("2023-03-20"),
      departureDate: new Date("2023-03-30"),
      guestCounter: { adultsCount: 2, childrenCount: 1, infantsCount: 0 },
      currencyCode: "USD",
    };

    const flightSearchBody = createFlightSearchBody(userPreferences, listingInfo);

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