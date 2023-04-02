import { FlightSearchBody, FlightSearchBodySchema, OriginDestination, Traveler, SearchCriteria, DateTimeRange} from '../types-schemas/FlightSearchBody';
import { AirbnbListingInfo, GuestCounter } from '../types-schemas/ListingInfo';
import { UserPreferences } from '../types-schemas/UserPreferences';
import { AirportCode } from '../types-schemas/AirportCode';
import {TopAirportCodes} from './airportCode-api-client.class';

import hash from 'object-hash';

export default class FlightSearchParameter {
  private _flightSearchBody: FlightSearchBody;
  private static defaultSearchCriteria: SearchCriteria = {
    oneFlightOfferPerDay: true,
    maxFlightOffers: 7,
    flightFilters: {
      cabinRestrictions: [],
      connectionRestrictions: {},
    },
  }

  constructor(
    userPreferences: UserPreferences,
    airbnbListingInfo: AirbnbListingInfo,
    originAirportCodes: TopAirportCodes,
    destinationAirportCodes: TopAirportCodes,
    ) {
    const guestCounter = airbnbListingInfo.guestCounter;
    const currencyCode = airbnbListingInfo.currencyCode;

    const originDestinations = this.assembleOriginDestinations(userPreferences, airbnbListingInfo, originAirportCodes, destinationAirportCodes);
    const travelers = this.convertGuestCounterToTravelers(guestCounter);
    const sources = ['GDS'] as ['GDS']; //Currently only one 'GDS' is accepted
    const searchCriteria = this.createSearchCriteria(userPreferences);

    this._flightSearchBody = {
      currencyCode,
      originDestinations,
      travelers,
      sources,
      searchCriteria,
    };

    const parsedFlightSearchBody = FlightSearchBodySchema.safeParse(this._flightSearchBody);

    if(!parsedFlightSearchBody.success) {
      console.log(parsedFlightSearchBody);
      throw new Error('Failed to validate flightSearchBody: ' + JSON.stringify(parsedFlightSearchBody.error));
    } else {
      this._flightSearchBody = parsedFlightSearchBody.data;
    }
  }

  public getFlightSearchBody(): FlightSearchBody{
    return this._flightSearchBody;
  }

  // Returns a hash of the class so we can avoid duplicate API calls
  public hashifyInstance(): string {
    return hash(this._flightSearchBody);
  };

  private createSearchCriteria(userPreferences: UserPreferences): SearchCriteria {
    const searchCriteria = structuredClone(FlightSearchParameter.defaultSearchCriteria);

    //searchCriteria.flightFilters!.connectionRestrictions!.maxNumberOfConnections = userPreferences.maxStops;
    searchCriteria.flightFilters!.cabinRestrictions = [
      {
        cabin: userPreferences.travelClass,
        coverage: 'ALL_SEGMENTS',
        originDestinationIds: ['1', '2'],
      },
    ];

    return searchCriteria;
  }

  //Converting guestCounter from the listing, to travelers for the API
  private convertGuestCounterToTravelers(guestCounter: GuestCounter): Traveler[] {
    const travelersRes = [] as Traveler[];

    interface lookupTable {[key: string]: string};
    const guestTypeToTravelerType: lookupTable = {
      'adultsCount': 'ADULT',
      'childrenCount': 'CHILD',
      'infantsCount': 'SEATED_INFANT',
    };

    let idCounter = 1;

    // Iterate through each guest type (adultsCount, childrenCount, infantsCount) adding its count
    Object.keys(guestCounter).forEach((guestType) => {
      const guestCount = guestCounter[guestType as keyof GuestCounter];
      const travelerType = guestTypeToTravelerType[guestType];

      // Create a traveler object for each guest of this type, and give it a unique id
      for(let i = 0; i < guestCount; i++) {
        const traveler = {
          id: idCounter.toString(),
          travelerType,
        } as Traveler;

        travelersRes.push(traveler);
        idCounter++;
      }
    });
    return travelersRes;
  }

  private assembleOriginDestinations(userPreferences: UserPreferences, airbnbListingInfo: AirbnbListingInfo, originAirportCodes: TopAirportCodes, destinationAirportCodes: TopAirportCodes): OriginDestination[] {
    // Outbound flight
    const out = {} as OriginDestination;
    // Return flight
    const ret = {} as OriginDestination;
    const originDestinationsRes = [] as OriginDestination[];

    // Outbound flight
    if(userPreferences.searchOutboundFlight) {
      out.id = '1';
      out.originLocationCode = originAirportCodes[0];
      out.destinationLocationCode = destinationAirportCodes[0];
      out.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, true);
      // out.alternativeOriginCodes = formatAlternativeCodes(originAirportCodes);
      // out.alternativeDestinationCodes = formatAlternativeCodes(destinationAirportCodes);

      originDestinationsRes.push(out);
    }

    // Return flight
    if(userPreferences.searchReturnFlight) {
      ret.id = '2';
      ret.originLocationCode = destinationAirportCodes[0];
      ret.destinationLocationCode = originAirportCodes[0];
      ret.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, false);
      // ret.alternativeOriginCodes = formatAlternativeCodes(destinationAirportCodes);
      // ret.alternativeDestinationCodes = formatAlternativeCodes(originAirportCodes);
      
      originDestinationsRes.push(ret);
    }

    return originDestinationsRes;

    function formatAlternativeCodes(codes: TopAirportCodes): (AirportCode[] | undefined) {
      if (!codes[1]) return undefined;
      if (!codes[2]) return [codes[1]];
      return [codes[1], codes[2]];
    }
  }

  private createDepartureDateTimeRange(userPreferences: UserPreferences, airbnbListingInfo: AirbnbListingInfo, giveOutbound: boolean): DateTimeRange {
    const flightDateKey = giveOutbound ? 'outboundDate' : 'returnDate';

    const [time, timeWindow] = this.calculateDepartureTimeAndTimeWindow(userPreferences, giveOutbound);

    return {
      date: airbnbListingInfo[flightDateKey].toISOString().split('T')[0],
      dateWindow: 'I3D',// +/- 3 days , in order to find better flight days
      time: time,
      timeWindow: timeWindow,
    };
  }

  private calculateDepartureTimeAndTimeWindow(userPreferences: UserPreferences, giveOutbound: boolean): [string, string] {
    const userTimeWindow = giveOutbound ? userPreferences.outboundTimeWindow : userPreferences.returnTimeWindow;

    const earliestTime = userTimeWindow.earliestDepartureTime;
    const latestTime = userTimeWindow.latestDepartureTime;

    const middleTime = (earliestTime + latestTime) / 2;

    const time = numberToTimeString(middleTime);
    const timeWindow = `${Math.ceil((latestTime - earliestTime) / 2)}H`;
    return [time, timeWindow];

    function numberToTimeString(num: number): string {
      const hours = Math.floor(num);

      if (hours === 24) return '23:59:59';

      const minutes = Math.floor((num - hours) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    }
  }
}
