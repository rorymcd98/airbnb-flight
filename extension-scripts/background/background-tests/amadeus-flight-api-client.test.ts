import {describe, test, expect} from '@jest/globals';
import { FlightSearchBody } from '../../types-schemas/FlightSearchBody';
import { FlightSearchParameter } from './../flight-search-parameter.class';
import { AmadeusFlightApiClient } from '../amadeus-flight-api-client.class';
import { UserPreferences } from './../../types-schemas/UserPreferences';
import { airbnbListingInfoSchema } from './../../types-schemas/ListingInfo';

describe('AmadeusFlightApiClient class', () => {
  test('Should create a single instance of the class when .getInstance is called, but should throw an error when called again', async () => {
    const initialUserPreferences: UserPreferences =  {
      originLocation: 'LHR',
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

    const amadeusFlightApiClientInstance1 = AmadeusFlightApiClient.getInstance(initialUserPreferences);

    expect(amadeusFlightApiClientInstance1).toBeInstanceOf(AmadeusFlightApiClient);

    expect(() => {
      const amadeusFlightApiClientInstance2 = AmadeusFlightApiClient.getInstance(initialUserPreferences);
    }).toThrowError('AmadeusFlightApiClient is a singleton class, cannot create further instances.');
    
  });
});