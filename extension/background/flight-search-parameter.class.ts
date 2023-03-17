import { z } from 'zod'
import { loadObjectFromFile } from './object-storage'
import { FlightSearchBody, FlightSearchBodySchema, OriginDestination, Traveler, SearchCriteria, DateTimeRange} from '../types-schemas/FlightSearchBody'
import { AirbnbListingInfo, GuestCounter } from '../types-schemas/ListingInfo'
import { UserPreferences } from '../types-schemas/UserPreferences'

export class FlightSearchParameters {
  private _flightSearchBody: FlightSearchBody;
  private static defaultSearchCriteria: SearchCriteria = {
    oneFlightOfferPerDay: true,
    flightFilters: {
      cabinRestrictions: [],
      connectionRestrictions: {}
    },
  }

  constructor(
    userPreferences: UserPreferences,
    airbnbListingInfo: AirbnbListingInfo
    ){
    const guestCounter = airbnbListingInfo.guestCounter;

    const currencyCode = airbnbListingInfo.currencyCode;
    const originDestinations = this.assembleOriginDestinations(userPreferences, airbnbListingInfo);
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
  }

  public getFlightSearchBody(): FlightSearchBody{
    return this._flightSearchBody;
  }

  // Returns a hash of the class so we can avoid duplicate API calls
  public hashifyClass(): string {
    return '';
  };

  private createSearchCriteria(userPreferences: UserPreferences): SearchCriteria {
    const $ = structuredClone(FlightSearchParameters.defaultSearchCriteria);
    $.maxPrice = userPreferences.maxPrice;
    $.flightFilters!.connectionRestrictions!.maxNumberOfConnections = userPreferences.maxStops;

    return $;
  }

  //Converting guestCounter from the listing, to travelers for the API
  private convertGuestCounterToTravelers(guestCounter: GuestCounter): Traveler[] {
    const travelersRes = [] as Traveler[];
  
    interface lookupTable {[key: string]: string};
    const guestTypeToTravelerType: lookupTable = {
      'adultsCount' : 'ADULT',
      'childrenCount' : 'CHILD',
      'infantsCount' : 'SEATED_INFANT',
    }
    
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
    
  private assembleOriginDestinations(userPreferences: UserPreferences, airbnbListingInfo: AirbnbListingInfo): OriginDestination[] {
    //alias for the object we are building
    const out = {} as OriginDestination;
    const ret = {} as OriginDestination;
    const originDestinationsRes = [] as OriginDestination[];
    
    //Outbound flight
    if(userPreferences.searchOutboundFlight) {
      out.id = '1'; 
      out.originLocationCode = userPreferences.originLocation;
      out.originRadius = 0; //(dev) Eventually give the user control
      out.destinationLocationCode = airbnbListingInfo.destinationLocation;
      out.destinationRadius = 0; //(dev) as above
      out.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, true);

      originDestinationsRes.push(out);
    }

    //Return flight
    if(userPreferences.searchReturnFlight) {
      ret.id = '2';
      ret.originLocationCode = airbnbListingInfo.destinationLocation;
      ret.originRadius = 0; //(dev) Eventually give the user control
      ret.destinationLocationCode = userPreferences.originLocation;
      ret.destinationRadius = 0; //(dev) as above
      ret.departureDateTimeRange = this.createDepartureDateTimeRange(userPreferences, airbnbListingInfo, false);
      
      originDestinationsRes.push(ret);
    }
    
    return originDestinationsRes;
  }

  //
  private createDepartureDateTimeRange(userPreferences: UserPreferences, airbnbListingInfo: AirbnbListingInfo, giveOutbound: boolean): DateTimeRange {

    const flightDateKey = giveOutbound ? 'outboundDate' : 'returnDate';

    const [time, timeWindow] = this.calculateDepartureTimeAndTimeWindow(userPreferences, giveOutbound);

    return {
      date: airbnbListingInfo[flightDateKey].toISOString().split('T')[0],
      dateWindow: 'I3D',// +/- 3 days , in order to find better flight days
      time: time,
      timeWindow: timeWindow
    };
  }

  // Defines the time and timeWindow (strings) to mimic the user defined time window
  // We use the 'DEPARTURE TIME' because the API can only filter by departure OR arrival time .... we later .filter() the repsonse by arrival time
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
      
      if (hours == 24) return '23:59:59';

      const minutes = Math.floor((num - hours) * 60);
      return `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:00`;
    }
  }
}