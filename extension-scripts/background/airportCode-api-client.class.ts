// Helper types and schemas
import zod from 'zod'
import { type AirportCode, AirportCodeSchema } from '../types-schemas/AirportCode'
import privateVariables from '../../private-variables'

export type TopAirportCodes = [AirportCode, AirportCode | undefined, AirportCode | undefined]

const LatLngSchema = zod.object({
  lat: zod.number(),
  lng: zod.number()
})
type LatLng = zod.infer<typeof LatLngSchema>

// Takes in addresses: Fetches GeoCodes -> Fetches nearest airport codes
// Memoizes address -> airport code mapping
export default class AirportCodeApiClient {
  private static _instance: AirportCodeApiClient
  private readonly _knownAddressAirportMap = new Map<string, TopAirportCodes>()
  private static readonly GOOGLE_MAPS_API_KEY = privateVariables.GOOGLE_MAPS_API_KEY

  private constructor () {
  }

  public static getInstance (): AirportCodeApiClient {
    if (!AirportCodeApiClient._instance) {
      AirportCodeApiClient._instance = new AirportCodeApiClient()
      console.log('Initialized AirportCodeApiClient: ', AirportCodeApiClient._instance)
    } else {
      throw new Error('AirportCodeApiClient is a singleton class, cannot create further instances.')
    }
    return AirportCodeApiClient._instance
  }

  public async checkThenFetchAirportCodes (address: string, accessToken: string): Promise<TopAirportCodes> {
    // Check for known address
    console.log('Checking for known airport for address: ' + address + '...')
    if (this._knownAddressAirportMap.has(address)) {
      const topThreeAiportCodes = this._knownAddressAirportMap.get(address)!

      const [one, two, three] = topThreeAiportCodes
      console.log(`Retrieved from map airport codes: ${one} [${two}, ${three}]`)
      return topThreeAiportCodes

    // Fetch geoCode using new address
    } else {
      console.log('... Fetching from APIs instead')
      const geoCode = await this.callGeoCodeApi(address)
      const topThreeAiportCodes = await this.callAirportCodeApi(geoCode, accessToken)
      this._knownAddressAirportMap.set(address, topThreeAiportCodes)

      const [one, two, three] = topThreeAiportCodes
      console.log(`Fetched airport codes from API: ${one} [${two}, ${three}]`)
      return topThreeAiportCodes
    }
  }

  private async callAirportCodeApi (geoCode: LatLng, accessToken: string): Promise<TopAirportCodes> {
    const radiusToSearchKm = 500
    const airportCodeApiUrl = `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${geoCode.lat}&longitude=${geoCode.lng}&radius=${radiusToSearchKm}`
    // const airportCodeApiUrl = `https://api.amadeus.com/v1/reference-data/locations/airports?latitude=${geoCode.lat}&longitude=${geoCode.lng}&radius=${radiusToSearchKm}`;
    try {
      console.log('Fetching aiport code...')
      const response = await fetch(airportCodeApiUrl, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch airport code data, response status: ${response.status}`)
      }

      const responseParsed = await response.json()

      const airportsSortedByRelevance = responseParsed.data.sort((a: any, b: any) => {
        return b.relevance - a.relevance
      })

      const topThreeAirportCodes = airportsSortedByRelevance.slice(0, 3).map((airport: any) => {
        return airport.iataCode
      })

      const parsedMainAirportCode = AirportCodeSchema.safeParse(topThreeAirportCodes[0])
      if (!parsedMainAirportCode.success) {
        throw new Error('Invalid airport code data: ' + JSON.stringify(parsedMainAirportCode.error))
      }

      const parsedMainAirportCodes = [parsedMainAirportCode.data, topThreeAirportCodes[1], topThreeAirportCodes[2]]

      const airportAndCityCodes = parsedMainAirportCodes.map((airportCode: AirportCode): (AirportCode | undefined) => {
        return getCityCode(airportCode)
      })

      return airportAndCityCodes as TopAirportCodes
    } catch (error) {
      throw new Error('Failed to fetch airport code data, received error: ' + error)
    }
  }

  private async callGeoCodeApi (address: string): Promise<LatLng> {
    const formattedAddress = formatAddress(address)
    const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${AirportCodeApiClient.GOOGLE_MAPS_API_KEY}`

    try {
      console.log('Fetching geoCode...')
      const response = await fetch(geocodeApiUrl)
      if (!response || !response.ok) {
        console.log(response)
        throw new Error(`Failed to fetch geocode data, HTTP status: ${response.status}`)
      }

      const data = await response.json()

      console.log('Fetched geoCode: ' + JSON.stringify(data))

      const location = data.results[0].geometry.location

      const validLocation = LatLngSchema.safeParse(location)

      if (validLocation.success) {
        console.log('Fetched geoCode: ' + JSON.stringify(location))
        return validLocation.data
      } else {
        throw new Error('Invalid location data: ' + JSON.stringify(validLocation.error))
      }
    } catch (error) {

      throw error
    }

    // Handles both user inputs and Airbnb listing addresses
    function formatAddress (address: string) {
      // Replace commas, full stops, and other special characters with spaces
      address = address.replace(/[^\w\s]/gi, ' ')
      // Split the address into an array of words and numbers
      const addressArray = address.split(/\s+/)
      // Join the array with + symbols in between each element
      const formattedAddress = addressArray.join('+')
      return formattedAddress
    }
  }
}

// (dev) confusing shim, this should really be CityCode but I'm too lazy to change it
function getCityCode (airportCode: AirportCode): (AirportCode | undefined) {
  type AirportCodeToCityCodeMap = {
    [key in AirportCode]: AirportCode;
  }
  const airportCodeToCityCode: AirportCodeToCityCodeMap = {
    PEK: 'BJS', // Beijing, China
    PKX: 'BJS',
    NAY: 'BJS',
    ORD: 'CHI', // Chicago, United States
    MDW: 'CHI',
    RFD: 'CHI',
    DEL: 'DEL', // Delhi, India
    IXC: 'DEL',
    LKO: 'DEL',
    DXB: 'DXB', // Dubai, United Arab Emirates
    DWC: 'DXB',
    SHJ: 'DXB',
    FRA: 'FRA', // Frankfurt, Germany
    HHN: 'FRA',
    FKB: 'FRA',
    IST: 'IST', // Istanbul, Turkey
    SAW: 'IST',
    ESB: 'IST',
    CGK: 'JKT', // Jakarta, Indonesia
    HLP: 'JKT',
    BDO: 'JKT',
    LHR: 'LON', // London, United Kingdom
    LGW: 'LON',
    STN: 'LON',
    LCY: 'LON',
    LAX: 'LAX', // Los Angeles, United States
    BUR: 'LAX',
    SNA: 'LAX',
    SVO: 'MOW', // Moscow, Russia
    DME: 'MOW',
    VKO: 'MOW',
    BOM: 'BOM', // Mumbai, India
    PNQ: 'BOM',
    GOI: 'BOM',
    JFK: 'NYC', // New York, United States
    LGA: 'NYC',
    EWR: 'NYC',
    CDG: 'PAR', // Paris, France
    ORY: 'PAR',
    BVA: 'PAR',
    PVG: 'SHA', // Shanghai, China
    SHA: 'SHA',
    HSN: 'SHA',
    SYD: 'SYD', // Sydney, Australia
    BNE: 'SYD',
    MEL: 'SYD',
    HND: 'TYO', // Tokyo, Japan
    NRT: 'TYO',
    NGO: 'TYO'
  }

  return airportCodeToCityCode[airportCode] || airportCode
}
