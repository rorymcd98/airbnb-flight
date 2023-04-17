import FlightSearchParameter from '../flight-search-parameter.class';
import { describe, test, expect } from '@jest/globals';
describe('FlightSearchParameter class', () => {
    describe('createFlightSearchBody', () => {
        test('should create a valid FlightSearchParam object for outbound flight only', async () => {
            const userPreferences = {
                originLocation: 'London',
                searchOutboundFlight: true,
                searchReturnFlight: true,
                travelClass: 'ECONOMY',
                maxStops: 0,
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
            const airbnbListingInfo = {
                destinationLocation: 'Prague',
                outboundDate: new Date('2023-03-16'),
                returnDate: new Date('2023-03-20'),
                guestCounter: {
                    adultsCount: 2,
                    childrenCount: 1,
                    infantsCount: 0
                },
                currencyCode: 'GBP'
            };
            const originAirportCodes = ['LON', 'MAN', undefined];
            const destinationAirportCodes = ['PRG', 'BER', 'WRO'];
            const instanceOfFlightSearchParameter = new FlightSearchParameter(userPreferences, airbnbListingInfo, originAirportCodes, destinationAirportCodes);
            const flightSearchBody = instanceOfFlightSearchParameter.getFlightSearchBody();
            // Expected output:
            const expectedFlightSearchBody = {
                currencyCode: 'GBP',
                originDestinations: [
                    {
                        id: '1',
                        originLocationCode: 'LON',
                        destinationLocationCode: 'PRG',
                        departureDateTimeRange: {
                            date: '2023-03-16',
                            dateWindow: 'I3D'
                            // time: "09:00:00",
                            // timeWindow: "3H",
                        }
                    },
                    {
                        id: '2',
                        originLocationCode: 'PRG',
                        destinationLocationCode: 'LON',
                        departureDateTimeRange: {
                            date: '2023-03-20',
                            dateWindow: 'I3D'
                            // time: "12:00:00",
                            // timeWindow: "12H",
                        }
                    }
                ],
                travelers: [
                    {
                        id: '1',
                        travelerType: 'ADULT'
                    },
                    {
                        id: '2',
                        travelerType: 'ADULT'
                    },
                    {
                        id: '3',
                        travelerType: 'CHILD'
                    }
                ],
                sources: ['GDS'],
                searchCriteria: {
                    flightFilters: {
                        cabinRestrictions: [
                            {
                                cabin: 'ECONOMY',
                                coverage: 'ALL_SEGMENTS',
                                originDestinationIds: ['1', '2']
                            }
                        ],
                        connectionRestrictions: {}
                    },
                    oneFlightOfferPerDay: true
                }
            };
            expect(flightSearchBody).toEqual(expectedFlightSearchBody);
        });
    });
    test('the .hashifyInstance() method should hash two closely equivalent userPreferences and airbnbListingInfo objects to the same string when they become instances of the class.', () => {
        const userPreferences1 = {
            originLocation: 'LHR',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 0,
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
        const airbnbListingInfo1 = {
            destinationLocation: 'PRG',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'GBP'
        };
        const originLocationAirportCode1 = 'LHR';
        const destinationLocationAirportCode1 = 'PRG';
        const userPreferences2 = {
            originLocation: 'LHR',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 0,
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
        const airbnbListingInfo2 = {
            destinationLocation: 'PRG',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'GBP'
        };
        const originAirportCodes1 = ['LON', 'MAN', undefined];
        const destinationAirportCodes1 = ['PRG', 'BER', 'WRO'];
        const originAirportCodes2 = ['LON', 'MAN', undefined];
        const destinationAirportCodes2 = ['PRG', 'BER', 'WRO'];
        const instanceOfFlightSearchParameter1 = new FlightSearchParameter(userPreferences1, airbnbListingInfo1, originAirportCodes1, destinationAirportCodes1);
        const instanceOfFlightSearchParameter2 = new FlightSearchParameter(userPreferences2, airbnbListingInfo2, originAirportCodes2, destinationAirportCodes2);
        const hash1 = instanceOfFlightSearchParameter1.hashifyInstance();
        const hash2 = instanceOfFlightSearchParameter2.hashifyInstance();
        expect(hash1).toEqual(hash2);
    });
    test('the .hashifyInstance() method should not hash 2 minorly different instances to the same string.', () => {
        const userPreferences1 = {
            originLocation: 'LHR',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 0,
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
        const airbnbListingInfo1 = {
            destinationLocation: 'PRG',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'GBP'
        };
        const userPreferences2 = {
            originLocation: 'LHR',
            searchOutboundFlight: true,
            searchReturnFlight: true,
            travelClass: 'ECONOMY',
            maxStops: 0,
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
        const airbnbListingInfo2 = {
            destinationLocation: 'PRG',
            outboundDate: new Date('2022-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'GBP'
        };
        const originAirportCodes1 = ['LON', 'MAN', undefined];
        const destinationAirportCodes1 = ['PRG', 'BER', 'WRO'];
        const originAirportCodes2 = ['LON', 'MAN', undefined];
        const destinationAirportCodes2 = ['PRG', 'BER', 'WRO'];
        const instanceOfFlightSearchParameter1 = new FlightSearchParameter(userPreferences1, airbnbListingInfo1, originAirportCodes1, destinationAirportCodes1);
        const instanceOfFlightSearchParameter2 = new FlightSearchParameter(userPreferences2, airbnbListingInfo2, originAirportCodes2, destinationAirportCodes2);
        const hash1 = instanceOfFlightSearchParameter1.hashifyInstance();
        const hash2 = instanceOfFlightSearchParameter2.hashifyInstance();
        expect(hash1).not.toEqual(hash2);
    });
});
//# sourceMappingURL=flight-search-parameter.test.js.map