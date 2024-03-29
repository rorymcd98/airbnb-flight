import { type FlightSearchBody } from '../types-schemas/FlightSearchBody'
import FlightSearchParameter from './flight-search-parameter.class'
import { type AirbnbListingInfo } from '../types-schemas/ListingInfo'
import { type UserPreferences } from '../types-schemas/UserPreferences'
import AirportCodeApiClient from './airportCode-api-client.class'
import privateVariables from '../../private-variables'
import { type FlightOffersResponse, FlightOffersResponseSchema } from '../types-schemas/FlightOffersResponse'

export default class FlightApiClient {
  private static _instance: FlightApiClient
  private _clientId?: string
  private _clientSecret?: string
  private _accessToken?: string
  private _accessTokenExpiryTime: number = 0
  private readonly _flightSearchParameterMap = new Map<string, FlightOffersResponse>()
  private _userPreferences: UserPreferences = {} as UserPreferences
  private readonly _AirportCodeApiClient: AirportCodeApiClient

  private constructor (initialUserPreferences: UserPreferences) {
    if (privateVariables.DEV_MODE) {
      this._clientId = privateVariables.CLIENT_ID
      this._clientSecret = privateVariables.CLIENT_SECRET
    }

    this._userPreferences = initialUserPreferences
    this._AirportCodeApiClient = AirportCodeApiClient.getInstance()
  }

  public static getInstance (initialUserPreferences: UserPreferences): FlightApiClient {
    if (!FlightApiClient._instance) {
      FlightApiClient._instance = new FlightApiClient(initialUserPreferences)
      console.log('Initialized FlightApiClient: ', FlightApiClient._instance)
    } else {
      throw new Error('FlightApiClient is a singleton class, cannot create further instances.')
    }

    return FlightApiClient._instance
  }

  // Primary public method for this class - retrieve a flight offer for a given listing
  // If we've already searched for this listing, return the memoised result
  public async getFlightOffersForListing (airbnbListingInfo: AirbnbListingInfo): Promise<FlightOffersResponse> {
    const airportCodeAccessToken = await this.getAccessToken()

    const homeAirportCodes = await this._AirportCodeApiClient.checkThenFetchAirportCodes(this._userPreferences.originLocation, airportCodeAccessToken)
    const destinationAirportCodes = await this._AirportCodeApiClient.checkThenFetchAirportCodes(airbnbListingInfo.destinationLocation, airportCodeAccessToken)

    const flightSearchParameter = new FlightSearchParameter(this._userPreferences, airbnbListingInfo, homeAirportCodes, destinationAirportCodes)
    const flightSearchBody = flightSearchParameter.getFlightSearchBody()
    const flightSearchBodyHash = flightSearchParameter.hashifyInstance()

    if (this._flightSearchParameterMap.has(flightSearchBodyHash)) {
      console.log('Flight search body already exists in map, returning memoised result...')
      return this._flightSearchParameterMap.get(flightSearchBodyHash)!
    }

    console.log('Flight search body does not exist in map, searching for flight offers...')
    const flightOffersResponse = await this.searchFlightOffers(flightSearchBody)
    this._flightSearchParameterMap.set(flightSearchBodyHash, flightOffersResponse)

    return flightOffersResponse
  }

  public setUserPreferences (newUserPreferences: UserPreferences) {
    this._userPreferences = newUserPreferences
  }

  public getUserPreferences (): UserPreferences {
    return this._userPreferences
  }

  private async searchFlightOffers (flightSearchBody: FlightSearchBody): Promise<FlightOffersResponse> {
    const accessToken = await this.getAccessToken()
    const apiUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers'
    // const apiUrl = 'https://api.amadeus.com/v2/shopping/flight-offers';

    console.log(`Searching for flight offers between ${flightSearchBody.originDestinations[0].originLocationCode} to ${flightSearchBody.originDestinations[0].destinationLocationCode}...`, flightSearchBody)
    console.log('Using access token: ' + accessToken)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify(flightSearchBody)
      })

      const flightOffersData = await response.json()

      if (flightOffersData.warnings) {
        console.warn('Warnings returned from flight search: ', flightOffersData.warnings)
      }

      console.log(flightOffersData)

      const parsedFlightOffersData = FlightOffersResponseSchema.safeParse(flightOffersData)

      if (!parsedFlightOffersData.success) {
        throw parsedFlightOffersData.error
      } else {
        return parsedFlightOffersData.data
      }
    } catch (error: any) {
      console.error(`Failed to search for flight offers: ${error.message}`)
      throw error
    }
  }

  // An accessToken is required for calling the amadeus API - we control access to these tokens on an AWS lambda server
  private async getAccessToken (): Promise<string> {
    // If we already have a non-expired accessToken, fetch that one
    if (this._accessToken && this._accessTokenExpiryTime > Date.now()) {
      console.log('Using existing access token: ' + this._accessToken + ' (expires at ' + new Date(this._accessTokenExpiryTime) + ')')
      return this._accessToken
    }

    // If we're in DEV_MODE, use our key to get an accessToken
    if (privateVariables.DEV_MODE) {
      const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token'
      // const tokenUrl = 'https://api.amadeus.com/v1/security/oauth2/token';
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
      const data = `grant_type=client_credentials&client_id=${this._clientId}&client_secret=${this._clientSecret}`

      this._clientId = process.env.API_KEY
      this._clientSecret = process.env.API_SECRET
      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers,
          body: data
        })

        const responseData = await response.json()
        const accessToken = responseData.access_token

        this._accessToken = accessToken
        this._accessTokenExpiryTime = Date.now() + responseData.expires_in * 1000

        if (responseData.warnings) {
          console.warn('Warnings returned from access token request: ', responseData.warnings)
        }

        if (accessToken === undefined) {
          throw new Error('Failed to retrieve access token from Amadeus API')
        }

        console.log('New access token retrieved: ' + accessToken + ' (expires at ' + new Date(this._accessTokenExpiryTime) + ')')

        return accessToken as string
      } catch (error) {
        console.log(error)
        throw error
      }
    } else {
      // If we're not in DEV_MODE, call the AWS lambda server to get an accessToken
      const tokenUrl = ''// aws url
      const headers = { 'Content-Type': 'application/json' }
      const data = { client_id: this._clientId, client_secret: this._clientSecret }

      try {
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(data)
        })

        const responseData = await response.json()
        const accessToken = responseData.access_token

        this._accessToken = accessToken
        this._accessTokenExpiryTime = Date.now() + responseData.expires_in * 1000
        return accessToken as string
      } catch (error) {
        console.log(error)
        throw error
      }
    }
  }
};

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
