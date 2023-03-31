//Helper types and schemas
import zod from 'zod';
import { AirportCode, AirportCodeSchema } from '../types-schemas/AirportCode';

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
  private static GOOGLE_MAPS_API_KEY = "AIzaSyAcEzEfvJsCjcz0L29p4kkUXTOOJtbP9EM";
  
  private constructor() {
  }

  public static getInstance(): AirportCodeApiClient {
    if (!AirportCodeApiClient._instance) {
      AirportCodeApiClient._instance = new AirportCodeApiClient();
    } else {
      throw new Error('AirportCodeApiClient is a singleton class, cannot create further instances.');
    }
    return AirportCodeApiClient._instance;
  }

  public async fetchAirportCode(address: string): Promise<AirportCode> {
    const geoCode = await this.checkThenFetchGeoCode(address);
    const airportCode = await this.callAirportCodeApi(geoCode);
    return airportCode;
  }

  private async callAirportCodeApi(geoCode: LatLng): Promise<AirportCode> {

  }


  //Fetch geoCode (Latitude - Longitude) using google API
  private async checkThenFetchGeoCode(address: string): Promise<LatLng> {

    //Check for known address
    if (this._knownGeoCodeMap.has(address)) {
      return this._knownGeoCodeMap.get(address)!;

    //Fetch geoCode using new address
    } else {
     const geoCode = await this.fetchGeoCode(address);
     this._knownGeoCodeMap.set(address, geoCode);
      return geoCode;
    }
  }

  private async fetchGeoCode(address: string): Promise<LatLng> {
    const formattedAddress = formatAddress(address);
    const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${AirportCodeApiClient.GOOGLE_MAPS_API_KEY}`;

    try {
      const response = await fetch(geocodeApiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch geocode data, HTTP status: ${response.status}`);
      }
      const data = await response.json();
      const location = data.results[0].geometry.location;

      const validLocation = LatLngSchema.safeParse(location);
      
      if (validLocation.success) {
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
