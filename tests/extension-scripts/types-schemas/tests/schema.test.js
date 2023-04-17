import { FlightSearchBodySchema } from '../FlightSearchBody';
import { airbnbListingInfoSchema } from '../ListingInfo';
import { userPreferencesSchema } from '../UserPreferences';
import { AirportCodeSchema } from '../AirportCode';
import { describe, test, expect } from '@jest/globals';
import { FlightOffersResponseSchema } from '../FlightOffersResponse';
import ExpectedFlightOffersResponse from './flightOffersResponse.test.json';
describe('AirportCode Schema checker', () => {
    const goodAirportCodes = ['LHR', 'MAD', 'NYC', 'PRG', 'SFO', 'SIN', 'SYD', 'TPE', 'YYZ'];
    const badAirportCodes = ['LHR1', 'MAD1', 'NYC1', 'PRG1', 'PRAGUE', 'SIN1', 'password1', 'TPE1', 'YYZ1'];
    test('should pass the goodAirportCodes', () => {
        goodAirportCodes.forEach((airportCode) => {
            expect(AirportCodeSchema.safeParse(airportCode).success).toBe(true);
        });
    });
    test('should throw an error when the badAirportCodes are used', () => {
        badAirportCodes.forEach((airportCode) => {
            expect(AirportCodeSchema.safeParse(airportCode).success).toBe(false);
        });
    });
});
describe('FlightSearchBody Schema checker', () => {
    const goodFlightSearchBody = {
        currencyCode: 'USD',
        originDestinations: [
            {
                id: '0',
                originLocationCode: 'NYC',
                destinationLocationCode: 'MAD',
                departureDateTimeRange: {
                    date: '2023-11-01',
                    time: '10:00:00'
                }
            },
            {
                id: '1',
                originLocationCode: 'NYC',
                destinationLocationCode: 'MAD',
                departureDateTimeRange: {
                    date: '2023-12-01',
                    time: '10:00:00'
                }
            }
        ],
        travelers: [
            {
                id: '0',
                travelerType: 'ADULT'
            }
        ],
        sources: [
            'GDS'
        ],
        searchCriteria: {
            maxFlightOffers: 2,
            flightFilters: {
                cabinRestrictions: [
                    {
                        cabin: 'BUSINESS',
                        coverage: 'MOST_SEGMENTS',
                        originDestinationIds: [
                            '1'
                        ]
                    }
                ]
            }
        }
    };
    test('should pass the goodFlightSearchBody', () => {
        expect(FlightSearchBodySchema.safeParse(goodFlightSearchBody).success).toBe(true);
    });
    test("should throw an error when the originDestinations aren't in chronological order", () => {
        const badFlightSearchBody = structuredClone(goodFlightSearchBody);
        badFlightSearchBody.originDestinations[1].departureDateTimeRange.date = '2023-10-01';
        expect(() => FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError('The date/time of OriginDestination are not in chronological order.');
    });
    test('should throw an error when there are duplicate Ids for travelers', () => {
        const badFlightSearchBody = structuredClone(goodFlightSearchBody);
        badFlightSearchBody.travelers.push({
            id: '0',
            travelerType: 'ADULT'
        });
        expect(() => FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError('The id property of the traveler objects must be unique.');
    });
    test('should throw an error when there are duplicate Ids for originDestinations', () => {
        const badFlightSearchBody = structuredClone(goodFlightSearchBody);
        badFlightSearchBody.originDestinations.push({
            id: '0',
            originLocationCode: 'NYC',
            destinationLocationCode: 'MAD',
            departureDateTimeRange: {
                date: '2023-12-01',
                time: '10:00:00'
            }
        });
        expect(() => FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError('The id property of the originDestination objects must be unique.');
    });
    test('should throw an error when the originLocation is lower case', () => {
        const badFlightSearchBody = structuredClone(goodFlightSearchBody);
        badFlightSearchBody.originDestinations[0].originLocationCode = 'nyc';
        expect(() => FlightSearchBodySchema.parse(badFlightSearchBody)).toThrowError(/invalid_string/);
    });
});
describe('userPreferencesSchema', () => {
    test('should validate a valid user preferences object', () => {
        const userPreferences = {
            originLocation: 'London',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 1,
            outboundTimeWindow: {
                earliestDepartureTime: 6,
                latestDepartureTime: 12,
                earliestArrivalTime: 12,
                latestArrivalTime: 18
            },
            returnTimeWindow: {
                earliestDepartureTime: 0,
                latestDepartureTime: 24,
                earliestArrivalTime: 0,
                latestArrivalTime: 24
            }
        };
        expect(() => userPreferencesSchema.parse(userPreferences)).not.toThrow();
    });
    test('Should fill in the default time values for timeWindows (0, 24)', () => {
        const userPreferences = {
            originLocation: 'London',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 1,
            outboundTimeWindow: {},
            returnTimeWindow: {
                earliestDepartureTime: 1,
                latestDepartureTime: 19
            }
        };
        const parsedUserPreferences = userPreferencesSchema.parse(userPreferences);
        const parsedReturnTimeWindow = parsedUserPreferences.returnTimeWindow;
        const parsedOutboundimeWindow = parsedUserPreferences.outboundTimeWindow;
        const expectedOutboundTimeWindow = {
            earliestDepartureTime: 0,
            latestDepartureTime: 24,
            earliestArrivalTime: 0,
            latestArrivalTime: 24
        };
        const expectedReturnTimeWindow = {
            earliestDepartureTime: 1,
            latestDepartureTime: 19,
            earliestArrivalTime: 0,
            latestArrivalTime: 24
        };
        expect(parsedOutboundimeWindow).toStrictEqual(expectedOutboundTimeWindow);
        expect(parsedReturnTimeWindow).toStrictEqual(expectedReturnTimeWindow);
    });
    test('should not validate an invalid user preferences object with inconsistent times', () => {
        const userPreferences1 = {
            originLocation: 'London',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 1,
            // earliest departure time is after latest departure time
            outboundTimeWindow: {
                earliestDepartureTime: 5,
                latestDepartureTime: 4,
                earliestArrivalTime: 1,
                latestArrivalTime: 2
            },
            returnTimeWindow: {
                earliestDepartureTime: 1,
                latestDepartureTime: 2,
                earliestArrivalTime: 1,
                latestArrivalTime: 2
            }
        };
        expect(() => userPreferencesSchema.parse(userPreferences1)).toThrowError('Earliest departure/arrival time must be before latest departure/arrival time.');
        const userPreferences2 = {
            originLocation: 'London',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 1,
            outboundTimeWindow: {
                earliestDepartureTime: 1,
                latestDepartureTime: 2,
                earliestArrivalTime: 1,
                latestArrivalTime: 2
            },
            // earliest arrival time is after latest arrival time
            returnTimeWindow: {
                earliestDepartureTime: 1,
                latestDepartureTime: 2,
                earliestArrivalTime: 10,
                latestArrivalTime: 2
            }
        };
        expect(() => userPreferencesSchema.parse(userPreferences2)).toThrowError('Earliest departure/arrival time must be before latest departure/arrival time.');
    });
    test('should through an error if the travelClass is not one of ECONOMY etc.', () => {
        const userPreferences = {
            originLocation: 'London',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'SUPER_CLASS',
            maxStops: 1,
            outboundTimeWindow: {
                earliestDepartureTime: 6,
                latestDepartureTime: 12,
                earliestArrivalTime: 12,
                latestArrivalTime: 18
            },
            returnTimeWindow: {
                earliestDepartureTime: 0,
                latestDepartureTime: 24,
                earliestArrivalTime: 0,
                latestArrivalTime: 24
            }
        };
        expect(() => userPreferencesSchema.parse(userPreferences)).toThrowError(/invalid_union/);
    });
});
describe('airbnbListingInfoSchema', () => {
    test('validates with correct airbnbListingInfo', () => {
        const airbnbListingInfo = {
            destinationLocation: 'ABC123',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'USD'
        };
        expect(airbnbListingInfoSchema.parse(airbnbListingInfo)).toEqual(airbnbListingInfo);
    });
    test('throws an error if outbound date is after return date', () => {
        const airbnbListingInfo = {
            destinationLocation: 'ABC123',
            outboundDate: new Date('2023-03-20'),
            returnDate: new Date('2023-03-16'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'USD'
        };
        expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrowError('Outbound date must be before return date');
    });
    test('throws an error if adultsCount is less than 1', () => {
        const airbnbListingInfo = {
            destinationLocation: 'ABC123',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 0,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'USD'
        };
        expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrowError(/Number must be greater than or equal to 1/);
    });
    test('throws an error if childrenCount is less than 0', () => {
        const airbnbListingInfo = {
            destinationLocation: 'ABC123',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: -1,
                infantsCount: 0
            },
            currencyCode: 'USD'
        };
        expect(() => airbnbListingInfoSchema.parse(airbnbListingInfo)).toThrowError(/Number must be greater than or equal to 0/);
    });
    test('throws an error if currencyCode is not in ISO 4217 format', () => {
        const airbnbListingInfo = {
            destinationLocation: 'ABC123',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
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
describe('FlightOffersRespoonseSchema', () => {
    test('should validate a valid flight offers response', () => {
        const parsedResponse = FlightOffersResponseSchema.safeParse(ExpectedFlightOffersResponse);
        expect(parsedResponse.success).toBeTruthy();
    });
});
//# sourceMappingURL=schema.test.js.map