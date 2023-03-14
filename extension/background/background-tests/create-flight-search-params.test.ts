import { createFlightSearchBody } from '../create-flight-search-body';
import { IFlightSearchBody} from '../../interfaces/FlightSearchBody'
import { IAirbnbListingInfo} from '../../interfaces/ListingInfo'
import { IUserPreferences } from '../../interfaces/UserPreferences'


import {describe, test, expect} from '@jest/globals';


describe('createFlightSearchParam', () => {
  test('should create a valid FlightSearchParam object for outbound flight only', () => {
    const userPreferences: IUserPreferences = {
      departingLocation: "LAX",
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
    const expectedFlightSearchBody: IFlightSearchBody = {
      currencyCode: "USD",
      originDestinations: [
        {
          id: "od0",
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
          id: "ADT",
          travelerType: "ADULT"
        },
        {
          id: "CNN",
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