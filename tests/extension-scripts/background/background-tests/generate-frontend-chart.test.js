import { generateFrontendChartData, generateChartMeta } from '../generate-frontend-chart';
import { describe, test, expect } from '@jest/globals';
// Test case data
import flightOffersJson from './find-cheapest-flight.test.json';
// Expected test case result
import expectedFrontendOffersData from './frontendOffersData.test.json';
const flightOffers = flightOffersJson;
const listingInfo = {
    destinationLocation: 'London, United Kingdom',
    outboundDate: new Date('2023-04-13'),
    returnDate: new Date('2023-04-16'),
    guestCounter: {
        adultsCount: 2,
        childrenCount: 0,
        infantsCount: 0
    },
    currencyCode: 'GBP'
};
describe('generateFrontendChartData', () => {
    test('Should continue to generate the developer validated frontendOffersData', () => {
        const frontendOffersData = generateFrontendChartData(flightOffers, listingInfo);
        expect(frontendOffersData).toEqual(expectedFrontendOffersData);
    });
    test('should return empty objects when no flights are found (0 FlightOffers)', () => {
        const flightOffers = [];
        const frontendOffersData = generateFrontendChartData(flightOffers, listingInfo);
        expect(frontendOffersData.cheapestFlightsAnyDuration).toEqual({});
        expect(frontendOffersData.cheapestFlightsTripDuration).toEqual({});
        expect(frontendOffersData.cheapestFlightOutboundReturn).toEqual({});
    });
});
describe('generateChartMeta', () => {
    test('Should return the correct chart meta data', () => {
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
        const listingInfo = {
            destinationLocation: 'Prague, Czech Republic',
            outboundDate: new Date('2023-03-16'),
            returnDate: new Date('2023-03-20'),
            guestCounter: {
                adultsCount: 2,
                childrenCount: 1,
                infantsCount: 0
            },
            currencyCode: 'USD'
        };
        const expectedChartMeta = {
            currency: 'USD',
            originLocation: 'London',
            destinationLocation: 'Prague, Czech Republic',
            tripDuration: 4
        };
        const chartMeta = generateChartMeta(listingInfo, userPreferences);
        expect(chartMeta).toEqual(expectedChartMeta);
    });
});
//# sourceMappingURL=generate-frontend-chart.test.js.map