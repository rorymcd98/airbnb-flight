
import { z } from 'zod'
import { FlightSearchBody, FlightSearchBodySchema } from './FlightSearchBody'
import { AirbnbListingInfo, airbnbListingInfoSchema} from './ListingInfo'
import { UserPreferences, userPreferencesSchema } from './UserPreferences'
import {describe, test, expect} from '@jest/globals';


describe('FlightSearchBody Schema checker', () => {
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

describe('userPreferencesSchema', () => {
  test('should validate a valid user preferences object', () => {
    const userPreferences: UserPreferences =  {
      departingLocations: ['LHR'],
      searchOutboundFlight: true,
      searchReturnFlight: true,
      travelClasses: {
        ECONOMY: true,
        PREMIUM_ECONOMY: false,
        BUSINESS: true,
        FIRST: false,
      },
      maxStops: 1,
      maxPrice: 500,
      earliestDepartureTime: 6,
      latestDepartureTime: 12,
      earliestArrivalTime: 8,
      latestArrivalTime: 14,
    };
    expect(() => userPreferencesSchema.parse(userPreferences)).not.toThrow();
  });

  test('should not validate an invalid user preferences object with inconsistent times', () => {
    const userPreferences: UserPreferences =  {
      departingLocations: ['LHR'],
      searchOutboundFlight: true,
      searchReturnFlight: true,
      travelClasses: {
        ECONOMY: true,
        PREMIUM_ECONOMY: false,
        BUSINESS: true,
        FIRST: false,
      },
      maxStops: 1,
      maxPrice: 500,
      earliestDepartureTime: 14,
      latestDepartureTime: 12,
      earliestArrivalTime: 16,
      latestArrivalTime: 8,
    };
    expect(() => userPreferencesSchema.parse(userPreferences)).toThrowError(
      'Earliest departure/arrival time must be before latest departure/arrival time.',
    );
  });

  test('should not validate an invalid user preferences object with invalid departingLocations', () => {
    const userPreferences: UserPreferences =  {
      departingLocations: ['lhr'],
      searchOutboundFlight: true,
      searchReturnFlight: true,
      travelClasses: {
        ECONOMY: true,
        PREMIUM_ECONOMY: false,
        BUSINESS: true,
        FIRST: false,
      },
      maxStops: 1,
      maxPrice: 500,
      earliestDepartureTime: 6,
      latestDepartureTime: 12,
      earliestArrivalTime: 8,
      latestArrivalTime: 14,
    };
    expect(() => userPreferencesSchema.parse(userPreferences)).toThrowError(
      /invalid_string/
    );
  });

  test('should through an error if there is no selected travelClass', () => {
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
    expect(() => userPreferencesSchema.parse(userPreferences)).toThrowError(
      "At least one travel class must be selected."
    );
  });

});


describe('airbnbListingInfoSchema', () => {
  test('validates with correct airbnbListingInfo', () => {
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
    expect(airbnbListingInfoSchema.parse(airbnbListingInfo)).toEqual(airbnbListingInfo);
  });

  test('throws an error if arrival date is after departure date', () => {
    const airbnbListingInfo: AirbnbListingInfo  ={
      destinationLocation: 'ABC123',
      arrivalDate: new Date('2023-03-20'),
      departureDate: new Date('2023-03-16'),
      guestCounter: {
        adultsCount: 2,
        childrenCount: 1,
        infantsCount: 0
      },
      currencyCode: 'USD'
    };
    expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrow('Arrival date must be before departure date');
  });

  test('throws an error if adultsCount is less than 1', () => {
    const airbnbListingInfo: AirbnbListingInfo  ={
      destinationLocation: 'ABC123',
      arrivalDate: new Date('2023-03-16'),
      departureDate: new Date('2023-03-20'),
      guestCounter: {
        adultsCount: 0,
        childrenCount: 1,
        infantsCount: 0
      },
      currencyCode: 'USD'
    };
    expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrowError(
      /Number must be greater than or equal to 1/
    );
  });

  test('throws an error if childrenCount is less than 0', () => {
    const airbnbListingInfo: AirbnbListingInfo  ={
      destinationLocation: 'ABC123',
      arrivalDate: new Date('2023-03-16'),
      departureDate: new Date('2023-03-20'),
      guestCounter: {
        adultsCount: 2,
        childrenCount: -1,
        infantsCount: 0
      },
      currencyCode: 'USD'
    };
    expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrowError(
      /Number must be greater than or equal to 0/
    );
  });

  test('throws an error if currencyCode is not in ISO 4217 format', () => {
    const airbnbListingInfo: AirbnbListingInfo  ={
    destinationLocation: 'ABC123',
    arrivalDate: new Date('2023-03-16'),
    departureDate: new Date('2023-03-20'),
    guestCounter: {
    adultsCount: 2,
    childrenCount: 1,
    infantsCount: 0
    },
    currencyCode: 'US'
    };
    expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrow(/invalid/);
    });
});