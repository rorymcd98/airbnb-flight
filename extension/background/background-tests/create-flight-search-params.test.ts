import { z } from 'zod'
import { createFlightSearchBody } from '../create-flight-search-body';
import { FlightSearchBodySchema } from '../../types-schemas/FlightSearchBody'
import { AirbnbListingInfo} from '../../types-schemas/ListingInfo'
import { IUserPreferences } from '../../types-schemas/UserPreferences'
import {describe, test, expect} from '@jest/globals';

type FlightSearchBody = z.infer<typeof FlightSearchBodySchema>;

const goodFlightSearchBody: FlightSearchBody = {
  "currencyCode": "USD",
  "originDestinations": [
    {
      "id": "0",
      "originLocationCode": "NYC",
      "destinationLocationCode": "MAD",
      "departureDateTimeRange": {
        "date": "2023-11-01",
        "time": "10:00:00"
      }
    },
    {
      "id": "1",
      "originLocationCode": "NYC",
      "destinationLocationCode": "MAD",
      "departureDateTimeRange": {
        "date": "2023-12-01",
        "time": "10:00:00"
      }
    }
  ],
  "travelers": [
    {
      "id": "0",
      "travelerType": "ADULT"
    }
  ],
  "sources": [
    "GDS"
  ],
  "searchCriteria": {
    "maxFlightOffers": 2,
    "flightFilters": {
      "cabinRestrictions": [
        {
          "cabin": "BUSINESS",
          "coverage": "MOST_SEGMENTS",
          "originDestinationIds": [
            "1"
          ]
        }
      ]
    }
  }
};

describe('FlightSearchBody Schema checker', () => {
  test('should pass the goodFlightSearchBody', () => {
    expect(FlightSearchBodySchema.safeParse(goodFlightSearchBody).success).toBe(true);
  })

  test("should throw an error when the originDestinations aren't in chronological order", () => {

    const badFlightSearchBody = structuredClone(goodFlightSearchBody);
    badFlightSearchBody.originDestinations[1]!.departureDateTimeRange!.date = "2023-10-01";

    expect(()=> FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError(
      "The date/time of OriginDestination are not in chronological order."
      );
  })

  test("should throw an error when there are duplicate Ids for travelers", () => {

    const badFlightSearchBody = structuredClone(goodFlightSearchBody);
    badFlightSearchBody.travelers.push({
      "id": "0",
      "travelerType": "ADULT"
    });

    expect(()=> FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError(
      "The id property of the traveler objects must be unique."
      );
  })

  test("should throw an error when there are duplicate Ids for originDestinations", () => {

    const badFlightSearchBody = structuredClone(goodFlightSearchBody);
    badFlightSearchBody.originDestinations.push({
      "id": "0",
      "originLocationCode": "NYC",
      "destinationLocationCode": "MAD",
      "departureDateTimeRange": {
        "date": "2023-12-01",
        "time": "10:00:00"
      }
    });

    expect(()=> FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError(
      "The id property of the originDestination objects must be unique."
      );
  })

})

// describe('createFlightSearchBody', () => {
//   test('should create a valid FlightSearchParam object for outbound flight only', () => {
//     const userPreferences: IUserPreferences = {
//       departingLocation: "LAX",
//       searchOutboundFlight: true,
//       searchReturnFlight: false,
//       travelClass: ["ECONOMY"],
//       airlineWhiteList: [],
//       airlineBlackList: [],
//       maxStops: 1,
//       maxPrice: 500,
//       earliestDepartureTime: 0,
//       latestDepartureTime: 24,
//       earliestArrivalTime: 0,
//       latestArrivalTime: 24,
//     };

//     const listingInfo: IAirbnbListingInfo = {
//       destinationLocation: "NYC",
//       arrivalDate: new Date("2023-03-20"),
//       departureDate: new Date("2023-03-30"),
//       guestCounter: { adultsCount: 2, childrenCount: 1, infantsCount: 0 },
//       currencyCode: "USD",
//     };

//     const flightSearchBody = createFlightSearchBody(userPreferences, listingInfo);

//     // Expected output:
//     const expectedFlightSearchBody: FlightSearchBody = {
//       currencyCode: "USD",
//       originDestinations: [
//         {
//           id: "1",
//           originLocationCode: "LAX",
//           destinationLocationCode: "NYC",
//           departureDateTimeRange: {
//             date: "2023-03-20",
//             time: "00:00:00",
//           },
//         },
//       ],
//       travelers: [
//         {
//           id: "1",
//           travelerType: "ADULT"
//         },
//         {
//           id: "1",
//           travelerType: "CHILD"
//         },
//       ],
//       sources: ["GDS"],
//       searchCriteria: {
//         maxFlightOffers: 50,
//         flightFilters: {
//           cabinRestrictions: [
//             {
//               cabin: "ECONOMY",
//               coverage: "MOST_SEGMENTS",
//               originDestinationIds: ["od0"],
//             },
//           ],
//           carrierRestrictions: {
//             excludedCarrierCodes: [],
//           },
//         },
//       },
//     };

//     expect(flightSearchBody).toEqual(expectedFlightSearchBody);
//   })
// });