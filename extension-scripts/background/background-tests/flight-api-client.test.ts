import {describe, test, expect} from '@jest/globals';
import { FlightSearchBody } from '../../types-schemas/FlightSearchBody';
import FlightSearchParameter from './../flight-search-parameter.class';
import FlightApiClient from '../flight-api-client.class';
import { UserPreferences } from './../../types-schemas/UserPreferences';
import { airbnbListingInfoSchema } from './../../types-schemas/ListingInfo';

describe('FlightApiClient class', () => {
  test('Should create a single instance of the class when .getInstance is called, but should throw an error when called again', async () => {
    const initialUserPreferences: UserPreferences =  {
      originLocation: 'London',
      searchOutboundFlight: true,
      searchReturnFlight: true,
      travelClass: "ECONOMY",
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

    const FlightApiClientInstance1 = FlightApiClient.getInstance(initialUserPreferences);

    expect(FlightApiClientInstance1).toBeInstanceOf(FlightApiClient);

    expect(() => {
      const FlightApiClientInstance2 = FlightApiClient.getInstance(initialUserPreferences);
    }).toThrowError('FlightApiClient is a singleton class, cannot create further instances.');
    
  });
});