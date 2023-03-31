import {describe, test, expect} from '@jest/globals';
import AirportCodeApiClient from '../airportCode-api-client.class';

describe('AirportCodeClient class', () => {
  test('Should create a single instance of the class when .getInstance is called, but should throw an error when called again', async () => {
   
    const geoCodeClient1 = AirportCodeApiClient.getInstance();

    expect(geoCodeClient1).toBeInstanceOf(AirportCodeApiClient);

    expect(() => {
      const geoCodeClient2 = AirportCodeApiClient.getInstance();
    }).toThrowError('AirportCodeApiClient is a singleton class, cannot create further instances.');
  });
});