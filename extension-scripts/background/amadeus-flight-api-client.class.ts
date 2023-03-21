import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import { FlightSearchBody } from '../types-schemas/FlightSearchBody';
import { FlightSearchParameter } from './flight-search-parameter.class';
import { AirbnbListingInfo } from '../types-schemas/ListingInfo';
import { UserPreferences } from '../types-schemas/UserPreferences';

type FlightOffersResponse = any; // (dev) need to define a FlightSearchResponse class

export class AmadeusFlightApiClient {
  private static _instance: AmadeusFlightApiClient;
  private _clientId?: string;
  private _clientSecret?: string;
  private _accessToken?: string;
  private _accessTokenExpiryTime: number = 0;
  private _flightSearchParameterMap: Map<string, FlightOffersResponse> = new Map();
  private _userPreferences: UserPreferences = {} as UserPreferences;
  
  private constructor(initialUserPreferences: UserPreferences) {
    if (process.env.DEV_MODE === 'true') {
      this._clientId = process.env.API_KEY;
      this._clientSecret = process.env.API_SECRET;
    }

    this._userPreferences = initialUserPreferences;
  }

  public static getInstance(initialUserPreferences: UserPreferences): AmadeusFlightApiClient {
    if (!AmadeusFlightApiClient._instance) {
      AmadeusFlightApiClient._instance = new AmadeusFlightApiClient(initialUserPreferences);
    } else {
      throw new Error('AmadeusFlightApiClient is a singleton class, cannot create further instances.');
    }

    return AmadeusFlightApiClient._instance;
  }

  //Primary public method for this class - retrieve a flight offer for a given listing
  //If we've already searched for this listing, return the memoised result
  public async getFlightOffersForListing(airbnbListingInfo: AirbnbListingInfo): Promise<FlightOffersResponse> {
    const flightSearchParameter = new FlightSearchParameter(this._userPreferences, airbnbListingInfo);
    const flightSearchBody = flightSearchParameter.getFlightSearchBody();
    const flightSearchBodyHash = flightSearchParameter.hashifyInstance();

    if (this._flightSearchParameterMap.has(flightSearchBodyHash)) {
      return this._flightSearchParameterMap.get(flightSearchBodyHash)!;
    }

    const flightOffersResponse = await this.searchFlightOffers(flightSearchBody);
    this._flightSearchParameterMap.set(flightSearchBodyHash, flightOffersResponse);

    return flightOffersResponse;
  }

  public setUserPreferences(newUserPreferences: UserPreferences) {
    this._userPreferences = newUserPreferences;
  }

  private async searchFlightOffers(flightSearchBody: FlightSearchBody): Promise<FlightOffersResponse> {

    const accessToken = this.getAccessToken();

    const apiUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
  
    try {
      const response = await axios.post(apiUrl, flightSearchBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      return response.data;
    } catch (error: any) {
      console.error(`Failed to search for flight offers: ${error.message}`);
    }
  }

  //An accessToken is required for calling the amadeus API - we control access to these tokens on an AWS lambda server
  private async getAccessToken() {
    //If we already have a non-expired accessToken, fetch that one
    if (this._accessToken && this._accessTokenExpiryTime > Date.now()) {
      return this._accessToken;
    }

    //If we're in DEV_MODE, use our key to get an accessToken
    if (process.env.DEV_MODE === 'true') {
      const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      const data = `grant_type=client_credentials&client_id=${this._clientId}&client_secret=${this._clientSecret}`;

      this._clientId = process.env.API_KEY;
      this._clientSecret = process.env.API_SECRET;
      try {
        const response = await axios.post(tokenUrl, data, { headers });
        const accessToken = response.data['access_token'];

        this._accessToken = accessToken;
        this._accessTokenExpiryTime = Date.now() + response.data['expires_in'] * 1000;

        return accessToken;
      } catch (error) {
        console.log(error);
      }
    //If we're not in DEV_MODE, use lambda AWS to get an accessToken
    } else {
      //(dev todo)
    }
  }

}

// Example amadeus flight offers body
// const flightSearchBody: FlightSearchBody = {
//   currencyCode: "USD",
//   originDestinations: [
//     {
//       id: "1",
//       originLocationCode: "LAX",
//       destinationLocationCode: "NYC",
//       departureDateTimeRange: {
//         date: "2023-03-20",
//         time: "23:59:59",
//         timeWindow: "12H"
//       }
//     }
//   ],
//   travelers: [
//     {
//       id: "1",
//       travelerType: "ADULT"
//     }
//   ],
//   sources: ["GDS"],
//   searchCriteria: {
//     maxFlightOffers: 6,
//     flightFilters: {
//       cabinRestrictions: [
//         {
//           cabin: "BUSINESS",
//           originDestinationIds: ["1"],
//         }
//       ],
//       connectionRestrictions: {
//         maxNumberOfConnections: 0,
//         nonStopPreferred: true,
//         nonStopPreferredWeight: 100,
//       },
      
//     },
//   },
// };