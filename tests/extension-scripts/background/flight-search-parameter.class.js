import { FlightSearchBodySchema } from '../types-schemas/FlightSearchBody';
import hash from 'object-hash';
export default class FlightSearchParameter {
    _flightSearchBody;
    static defaultSearchCriteria = {
        oneFlightOfferPerDay: true,
        // maxFlightOffers: 7,
        flightFilters: {
            cabinRestrictions: [],
            connectionRestrictions: {},
        },
    };
    constructor(userPreferences, airbnbListingInfo, originAirportCodes, destinationAirportCodes) {
        const guestCounter = airbnbListingInfo.guestCounter;
        const currencyCode = airbnbListingInfo.currencyCode;
        const originDestinations = this.assembleOriginDestinations(userPreferences, airbnbListingInfo, originAirportCodes, destinationAirportCodes);
        const travelers = this.convertGuestCounterToTravelers(guestCounter);
        const sources = ['GDS']; //Currently only one 'GDS' is accepted
        const searchCriteria = this.createSearchCriteria(userPreferences);
        this._flightSearchBody = {
            currencyCode,
            originDestinations,
            travelers,
            sources,
            searchCriteria,
        };
        const parsedFlightSearchBody = FlightSearchBodySchema.safeParse(this._flightSearchBody);
        if (!parsedFlightSearchBody.success) {
            console.log(parsedFlightSearchBody);
            throw new Error('Failed to validate flightSearchBody: ' + JSON.stringify(parsedFlightSearchBody.error));
        }
        else {
            this._flightSearchBody = parsedFlightSearchBody.data;
        }
    }
    getFlightSearchBody() {
        return this._flightSearchBody;
    }
    // Returns a hash of the class so we can avoid duplicate API calls
    hashifyInstance() {
        return hash(this._flightSearchBody);
    }
    ;
    createSearchCriteria(userPreferences) {
        const searchCriteria = structuredClone(FlightSearchParameter.defaultSearchCriteria);
        //searchCriteria.flightFilters!.connectionRestrictions!.maxNumberOfConnections = userPreferences.maxStops;
        searchCriteria.flightFilters.cabinRestrictions = [
            {
                cabin: userPreferences.travelClass,
                coverage: 'ALL_SEGMENTS',
                originDestinationIds: ['1', '2'],
            },
        ];
        return searchCriteria;
    }
    //Converting guestCounter from the listing, to travelers for the API
    convertGuestCounterToTravelers(guestCounter) {
        const travelersRes = [];
        ;
        const guestTypeToTravelerType = {
            'adultsCount': 'ADULT',
            'childrenCount': 'CHILD',
            'infantsCount': 'SEATED_INFANT',
        };
        let idCounter = 1;
        // Iterate through each guest type (adultsCount, childrenCount, infantsCount) adding its count
        Object.keys(guestCounter).forEach((guestType) => {
            const guestCount = guestCounter[guestType];
            const travelerType = guestTypeToTravelerType[guestType];
            // Create a traveler object for each guest of this type, and give it a unique id
            for (let i = 0; i < guestCount; i++) {
                const traveler = {
                    id: idCounter.toString(),
                    travelerType,
                };
                travelersRes.push(traveler);
                idCounter++;
            }
        });
        return travelersRes;
    }
    assembleOriginDestinations(userPreferences, airbnbListingInfo, originAirportCodes, destinationAirportCodes) {
        // Outbound flight
        const out = {};
        // Return flight
        const ret = {};
        const originDestinationsRes = [];
        // Outbound flight
        if (userPreferences.searchOutboundFlight) {
            out.id = '1';
            out.originLocationCode = originAirportCodes[0];
            out.destinationLocationCode = destinationAirportCodes[0];
            out.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, true);
            // out.alternativeOriginCodes = formatAlternativeCodes(originAirportCodes);
            // out.alternativeDestinationCodes = formatAlternativeCodes(destinationAirportCodes);
            originDestinationsRes.push(out);
        }
        // Return flight
        if (userPreferences.searchReturnFlight) {
            ret.id = '2';
            ret.originLocationCode = destinationAirportCodes[0];
            ret.destinationLocationCode = originAirportCodes[0];
            ret.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, false);
            // ret.alternativeOriginCodes = formatAlternativeCodes(destinationAirportCodes);
            // ret.alternativeDestinationCodes = formatAlternativeCodes(originAirportCodes);
            originDestinationsRes.push(ret);
        }
        return originDestinationsRes;
        function formatAlternativeCodes(codes) {
            if (!codes[1])
                return undefined;
            if (!codes[2])
                return [codes[1]];
            return [codes[1], codes[2]];
        }
    }
    createDepartureDateTimeRange(userPreferences, airbnbListingInfo, giveOutbound) {
        const flightDateKey = giveOutbound ? 'outboundDate' : 'returnDate';
        const [time, timeWindow] = this.calculateDepartureTimeAndTimeWindow(userPreferences, giveOutbound);
        return {
            date: airbnbListingInfo[flightDateKey].toISOString().split('T')[0],
            dateWindow: 'I3D', // +/- 3 days , in order to find better flight days
            // time: time,
            // timeWindow: timeWindow,
        };
    }
    calculateDepartureTimeAndTimeWindow(userPreferences, giveOutbound) {
        const userTimeWindow = giveOutbound ? userPreferences.outboundTimeWindow : userPreferences.returnTimeWindow;
        const earliestTime = userTimeWindow.earliestDepartureTime;
        const latestTime = userTimeWindow.latestDepartureTime;
        const middleTime = (earliestTime + latestTime) / 2;
        const time = numberToTimeString(middleTime);
        const timeWindow = `${Math.ceil((latestTime - earliestTime) / 2)}H`;
        return [time, timeWindow];
        function numberToTimeString(num) {
            const hours = Math.floor(num);
            if (hours === 24)
                return '23:59:59';
            const minutes = Math.floor((num - hours) * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        }
    }
}
