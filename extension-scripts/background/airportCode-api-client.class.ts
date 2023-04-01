//Helper types and schemas
import zod from 'zod';
import { AirportCode, AirportCodeSchema } from '../types-schemas/AirportCode';
import privateVariables from '../../private-variables';

const LatLngSchema = zod.object({
  lat: zod.number(),
  lng: zod.number(),
});
type LatLng = zod.infer<typeof LatLngSchema>;


//Takes in addresses: Fetches GeoCodes -> Fetches nearest airport codes
//Memoizes address -> airport code mapping
export default class AirportCodeApiClient {
  private static _instance: AirportCodeApiClient;
  private _knownAddressAirportMap: Map<string, AirportCode> = new Map();
  private static GOOGLE_MAPS_API_KEY = privateVariables.GOOGLE_MAPS_API_KEY;
  
  private constructor() {
  }

  public static getInstance(): AirportCodeApiClient {
    if (!AirportCodeApiClient._instance) {
      AirportCodeApiClient._instance = new AirportCodeApiClient();
      console.log('Initliazed AirportCodeApiClient: ' + AirportCodeApiClient._instance);
    } else {
      throw new Error('AirportCodeApiClient is a singleton class, cannot create further instances.');
    }
    return AirportCodeApiClient._instance;
  }

  public async checkThenFetchAirportCode(address: string, accessToken: string): Promise<AirportCode> { 
    //Check for known address
    console.log('Checking for known airport for address: ' + address + '...')
    if (this._knownAddressAirportMap.has(address)) {
      const airportCode = this._knownAddressAirportMap.get(address);

      console.log('Found known airport for address: ' + 'airportCode: ' + airportCode + ' address: ' + address)
      return airportCode!;

    //Fetch geoCode using new address
    } else {
      console.log('... Fetching from APIs instead')
      const geoCode = await this.callGeoCodeApi(address);
      const airportCode = await this.callAirportCodeApi(geoCode, accessToken);
      this._knownAddressAirportMap.set(address, airportCode);

      console.log('Fetched new airport for address: ' + 'airportCode: ' + airportCode + ' address: ' + address)
      return airportCode;
    }
  }

  private async callAirportCodeApi(geoCode: LatLng, accessToken: string): Promise<AirportCode> {

    // const shortLatString = geoCode.lat.toFixed(5).toString();
    // const shortLngString = geoCode.lng.toFixed(5).toString();

    const airportCodeApiUrl = `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${geoCode.lat}&longitude=${geoCode.lng}&radius=500`;
    
    try {
      console.log('Fetching aiport code...')
      const response = await fetch(airportCodeApiUrl, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok){
        throw new Error(`Failed to fetch airport code data: ${response.status}}`);
      }

      const responseParsed = await response.json();

      const airportCode = responseParsed.data[0].iataCode;
      const parsedAirportCode = AirportCodeSchema.safeParse(airportCode);
      
      if (parsedAirportCode.success) {
        console.log('Fetched airport code: ' + airportCode)
        return parsedAirportCode.data;
      } else {
        throw new Error('Invalid airport code data: ' + JSON.stringify(parsedAirportCode.error));
      }

    } catch (error) {
      throw new Error('Failed to fetch airport code data, received error: ' + error);
    }
  }

  private async callGeoCodeApi(address: string): Promise<LatLng> {
    const formattedAddress = formatAddress(address);
    const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${AirportCodeApiClient.GOOGLE_MAPS_API_KEY}`;

    try {
      console.log('Fetching geoCode...')
      const response = await fetch(geocodeApiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch geocode data, HTTP status: ${response.status}`);
      }

      const data = await response.json();

      const location = data.results[0].geometry.location;

      const validLocation = LatLngSchema.safeParse(location);
      
      if (validLocation.success) {
        console.log('Fetched geoCode: ' + JSON.stringify(location))
        return validLocation.data;
      } else {
        throw new Error('Invalid location data: ' + JSON.stringify(validLocation.error));
      }

    } catch (error) {
      throw new Error('Failed to fetch geocode data, received error: ' + error);
    }

    //Handles both user inputs and Airbnb listing addresses
    function formatAddress(address: string) {
      // Replace commas, full stops, and other special characters with spaces
      address = address.replace(/[^\w\s]/gi, ' ');
      // Split the address into an array of words and numbers
      let addressArray = address.split(/\s+/);
      // Join the array with + symbols in between each element
      let formattedAddress = addressArray.join('+');
      return formattedAddress;
    }
  }
}
