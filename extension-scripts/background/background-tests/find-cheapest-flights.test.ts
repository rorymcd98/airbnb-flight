import { FlightOffer, findCheapestFlights } from '../find-cheapest-flights';
import {describe, test, expect} from '@jest/globals';

const flightOffers: Record<string, FlightOffer> = {
  '1': {
    // ... flightOffer object 1
  },
  '2': {
    // ... flightOffer object 2
  },
  // ... more flight offers
};

describe('findCheapestFlights', () => {
  test('should return the cheapest flights for each departure date', () => {
    const cheapestFlights = findCheapestFlights(flightOffers);

    // Replace the expected values wtesth the correct values based on your flightOffers data
    expect(cheapestFlights['2023-05-13']).toEqual({
      flightDate: '2023-05-13',
      departureTime: '2023-05-13T20:00:00',
      arrivalTime: '2023-05-13T23:30:00',
      flightPrice: '128.20',
      carrier: 'AZ',
    });

    expect(cheapestFlights['2023-05-14']).toEqual({
      flightDate: '2023-05-14',
      departureTime: '2023-05-14T20:00:00',
      arrivalTime: '2023-05-14T23:30:00',
      flightPrice: '110.00',
      carrier: 'BA',
    });

    expect(cheapestFlights['2023-05-15']).toBeNull();
  });
});