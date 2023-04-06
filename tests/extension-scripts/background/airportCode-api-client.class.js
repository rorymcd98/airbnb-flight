//Helper types and schemas
import zod from 'zod';
import { AirportCodeSchema } from '../types-schemas/AirportCode';
import privateVariables from '../../private-variables';
const LatLngSchema = zod.object({
    lat: zod.number(),
    lng: zod.number(),
});
//Takes in addresses: Fetches GeoCodes -> Fetches nearest airport codes
//Memoizes address -> airport code mapping
export default class AirportCodeApiClient {
    static _instance;
    _knownAddressAirportMap = new Map();
    static GOOGLE_MAPS_API_KEY = privateVariables.GOOGLE_MAPS_API_KEY;
    constructor() {
    }
    static getInstance() {
        if (!AirportCodeApiClient._instance) {
            AirportCodeApiClient._instance = new AirportCodeApiClient();
            console.log('Initliazed AirportCodeApiClient: ' + AirportCodeApiClient._instance);
        }
        else {
            throw new Error('AirportCodeApiClient is a singleton class, cannot create further instances.');
        }
        return AirportCodeApiClient._instance;
    }
    async checkThenFetchAirportCodes(address, accessToken) {
        //Check for known address
        console.log('Checking for known airport for address: ' + address + '...');
        if (this._knownAddressAirportMap.has(address)) {
            const topThreeAiportCodes = this._knownAddressAirportMap.get(address);
            const [one, two, three] = topThreeAiportCodes;
            console.log(`Retrieved from map airport codes: ${one} [${two}, ${three}]`);
            return topThreeAiportCodes;
            //Fetch geoCode using new address
        }
        else {
            console.log('... Fetching from APIs instead');
            const geoCode = await this.callGeoCodeApi(address);
            const topThreeAiportCodes = await this.callAirportCodeApi(geoCode, accessToken);
            this._knownAddressAirportMap.set(address, topThreeAiportCodes);
            const [one, two, three] = topThreeAiportCodes;
            console.log(`Fetched airport codes from API: ${one} [${two}, ${three}]`);
            return topThreeAiportCodes;
        }
    }
    async callAirportCodeApi(geoCode, accessToken) {
        const radiusToSearchKm = 500;
        const airportCodeApiUrl = `https://test.api.amadeus.com/v1/reference-data/locations/airports?latitude=${geoCode.lat}&longitude=${geoCode.lng}&radius=${radiusToSearchKm}`;
        // const airportCodeApiUrl = `https://api.amadeus.com/v1/reference-data/locations/airports?latitude=${geoCode.lat}&longitude=${geoCode.lng}&radius=${radiusToSearchKm}`;
        try {
            console.log('Fetching aiport code...');
            const response = await fetch(airportCodeApiUrl, {
                method: 'get',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch airport code data, response status: ${response.status}`);
            }
            const responseParsed = await response.json();
            const airportsSortedByRelevance = responseParsed.data.sort((a, b) => {
                return b.relevance - a.relevance;
            });
            const topThreeAirportCodes = airportsSortedByRelevance.slice(0, 3).map((airport) => {
                return airport.iataCode;
            });
            const parsedMainAirportCode = AirportCodeSchema.safeParse(topThreeAirportCodes[0]);
            if (!parsedMainAirportCode.success) {
                throw new Error('Invalid airport code data: ' + JSON.stringify(parsedMainAirportCode.error));
            }
            const parsedMainAirportCodes = [parsedMainAirportCode.data, topThreeAirportCodes[1], topThreeAirportCodes[2]];
            const airportAndCityCodes = parsedMainAirportCodes.map((airportCode) => {
                return getCityCode(airportCode);
            });
            return airportAndCityCodes;
        }
        catch (error) {
            throw new Error('Failed to fetch airport code data, received error: ' + error);
        }
    }
    async callGeoCodeApi(address) {
        const formattedAddress = formatAddress(address);
        const geocodeApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${formattedAddress}&key=${AirportCodeApiClient.GOOGLE_MAPS_API_KEY}`;
        try {
            console.log('Fetching geoCode...');
            const response = await fetch(geocodeApiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch geocode data, HTTP status: ${response.status}`);
            }
            const data = await response.json();
            const location = data.results[0].geometry.location;
            const validLocation = LatLngSchema.safeParse(location);
            if (validLocation.success) {
                console.log('Fetched geoCode: ' + JSON.stringify(location));
                return validLocation.data;
            }
            else {
                throw new Error('Invalid location data: ' + JSON.stringify(validLocation.error));
            }
        }
        catch (error) {
            throw new Error('Failed to fetch geocode data, received error: ' + error);
        }
        //Handles both user inputs and Airbnb listing addresses
        function formatAddress(address) {
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
//(dev) confusing shim, this should really be CityCode but I'm too lazy to change it
function getCityCode(airportCode) {
    const airportCodeToCityCode = {
        PEK: "BJS",
        PKX: "BJS",
        NAY: "BJS",
        ORD: "CHI",
        MDW: "CHI",
        RFD: "CHI",
        DEL: "DEL",
        IXC: "DEL",
        LKO: "DEL",
        DXB: "DXB",
        DWC: "DXB",
        SHJ: "DXB",
        FRA: "FRA",
        HHN: "FRA",
        FKB: "FRA",
        IST: "IST",
        SAW: "IST",
        ESB: "IST",
        CGK: "JKT",
        HLP: "JKT",
        BDO: "JKT",
        LHR: "LON",
        LGW: "LON",
        STN: "LON",
        LCY: "LON",
        LAX: "LAX",
        BUR: "LAX",
        SNA: "LAX",
        SVO: "MOW",
        DME: "MOW",
        VKO: "MOW",
        BOM: "BOM",
        PNQ: "BOM",
        GOI: "BOM",
        JFK: "NYC",
        LGA: "NYC",
        EWR: "NYC",
        CDG: "PAR",
        ORY: "PAR",
        BVA: "PAR",
        PVG: "SHA",
        SHA: "SHA",
        HSN: "SHA",
        SYD: "SYD",
        BNE: "SYD",
        MEL: "SYD",
        HND: "TYO",
        NRT: "TYO",
        NGO: "TYO"
    };
    return airportCodeToCityCode[airportCode] || airportCode;
}
