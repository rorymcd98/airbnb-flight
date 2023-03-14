/**
 * @interface IFlightSearchBody defines the shape of the flight offers search POST request body
 * @property {string} currencyCode is automatically inferred from the Airbnb settings (ISO 4217 format - default is USD)
 * @property {OriginDestination[]} originDestinations array of OriginDestination objects (min: 1, max: 6)
 * @property {Traveler[]} travelers an array of traveler objects (min: 1, max: 18)
 * @property {string[]} sources is an array of strings that contain the source of the flight offer (currently only "GDS")
 * @property {SearchCriteria} searchCriteria is an object that contains the max flight offers and flight filters (cabin restrictions and carrier restrictions)
 *  */ 
export interface IFlightSearchBody {
    currencyCode?: string;
    originDestinations: OriginDestination[];
    travelers: Traveler[];
    sources: ["GDS"];
    searchCriteria?: SearchCriteria;
  }

/**
 * @type originDestination defines a pair of origins and destinatons which a traveller may fly between - including information about the departure and arrival date and time, location code, and options for alternative locations
 * 
 * @remarks originRadius and destinationRadisu annot be combined with originRadius, or destinationRadius
 * 
 * @property {string} id is a unique identifier for the origin and destination
 * @property {string} originLocationCode is the City or Airport origin location code (must be from IATA airport code list: https://www.iata.org/en/publications/directories/code-search/)
 * @property {number} originRadius is the radius to search for alternative locations from the originLocationCode (in km, up to 300km) 
 * @property {string[]} alternativeOriginCodes is an array of alternative origin location codes
 * @property {string} destinationLocationCode is the destination location code (as above)
 * @property {number} destinationRadius is the radius to search for alternative locations from the destinationLocationCode (in km, up to 300km)
 * @property {string[]} alternativeDestinationCodes is an array of alternative destination location codes
 * @property {DateTimeRange} departureDateTimeRange is an object that contains the departure date and time (date and time are in ISO 8601 format,  YYYY-MM-DD)
 * @property {DateTimeRange} arrivalDateTimeRange is an object that contains the arrival date and time (date and time are in ISO 8601 format, YYYY-MM-DD)
 * @property {string[]} includeConnectionPoints is an array of location codes to include as connection points
 * @property {string[]} excludeConnectionPoints is an array of location codes to exclude as connection points
 *  */ 
type OriginDestination = {
    id: string;
    originLocationCode: string;
    originRadius?: number;
    alternativeOriginCodes?: string[];
    destinationLocationCode?: string;
    destinationRadius?: number;
    alternativeDestinationCodes?: string[];
    departureDateTimeRange?: DateTimeRange;
    arrivalDateTimeRange?: DateTimeRange;
    includeConnectionPoints?: string[];
    excludeConnectionPoints?: string[];
  }

/**
 * @type DateTimeRange for date and time range objects which are used for the departure and arrival time for originDesination objects
 * 
 * @property {string} date is the date in ISO 8601 format (YYYY-MM-DD)
 * @property {string} dateWindow Pattern: ^[MPI][1-3]D ... M = -, P = +, I = +/- ... e.g. M3D = -3 days, P2D = +2 days, I1D = +/- 1 day
 * @property {string} time is the time in ISO 8601 format (HH:MM:SS)
 * @property {string} timeWindow Pattern: ^([1-9]|10|11|12)H ... e.g. 3H = +/- 3 hours
 * 
 * @remarks Cannot be combined with originRadius, or destinationRadius
 * */
type DateTimeRange = {
  date: string;
  dateWindow?: string;
  time?: string;
  timeWindow?: string;
}


/**
 * @type Traveler defines who the passenger is for the purpose of ticket pricing (Traveler ID becomes associated with a originDestination object)
 * 
 * @property {string} id is a unique identifier for the traveler which becomes associated with an originDestination object
 * @property {string} travelerType is the type of traveler (age restrictions are: CHILD < 12y, HELD_INFANT < 2y, SEATED_INFANT < 2y, SENIOR >=60y)
 * @property {string} associatedAdultId is the id of the associated adult traveler for a HELD_INFANT
 */
type Traveler = {
  id: string;
  travelerType: "ADULT" | "CHILD" | "SENIOR" | "YOUNG" | "HELD_INFANT" | "SEATED_INFANT" | "STUDENT";
  associatedAdultId?: string;
}
  
/**
 * @type SearchCriteria defines the max number of flight offers to return and the flight filters (cabin restrictions and carrier restrictions)
 * 
 * @remarks Entirely optional, will backfill this depending on which are used (dev)
 * 
 * */
type SearchCriteria = {
  excludeAllotments?: boolean;
  addOneWayOffers?: boolean;
  maxFlightOffers?: number;
  maxPrice?: number;
  allowAlternativeFareOptions?: boolean;
  oneFlightOfferPerDay?: boolean;

  additionalInformation?: {
    chargeableCheckedBags?: boolean;
    brandedFares?: boolean;
  };

  pricingOptions?: {
    includedCheckedBagsOnly?: boolean;
    refundableFaresOnly?: boolean;
    noRestrictionFare?: boolean;
    noPenaltyFare?: boolean;
  };

  flightFilters?: {
    crossBorderAllowed?: boolean;
    moreOvernightsAllowed?: boolean;
    returnToDepartureAirport?: boolean;
    railSegmentAllowed?: boolean;
    busSegmentAllowed?: boolean;
    maxFlightTime?: number;
    
    carrierRestrictions?: {
      blacklistedInEUAllowed?: boolean;
      excludedCarrierCodes?: string[];
      includedCarrierCodes?: string[];
    };

    cabinRestrictions?: {
      cabin?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";
      coverage?: "MOST_SEGMENTS" | "AT_LEAST_ONE_SEGMENT" | "ALL_SEGMENTS";
      originDestinationIds?: string[];
    }[];

    connectionRestrictions?: {
      maxNumberOfConnections?: number;
      nonStopPreferred?: boolean;
      nonStopPreferredWeight?: number;
      airportChangeAllowed?: boolean;
      technicalStopsAllowed?: boolean;
    }
  };
};

/**
 * @example of IFlightSearchBody
 * 
 * {
  "currencyCode": "USD",
  "originDestinations": [
    {
      "id": "1",
      "originLocationCode": "RIO",
      "destinationLocationCode": "MAD",
      "departureDateTimeRange": {
        "date": "2020-03-01",
        "time": "10:00:00"
      }
    },
    {
      "id": "2",
      "originLocationCode": "MAD",
      "destinationLocationCode": "RIO",
      "departureDateTimeRange": {
        "date": "2020-03-05",
        "time": "17:00:00"
      }
    }
  ],
  "travelers": [
    {
      "id": "1",
      "travelerType": "ADULT",
      "fareOptions": [
        "STANDARD"
      ]
    },
    {
      "id": "2",
      "travelerType": "CHILD",
      "fareOptions": [
        "STANDARD"
      ]
    }
  ],
  "sources": [
    "GDS"
  ],
  "searchCriteria": {
    "maxFlightOffers": 50,
    "flightFilters": {
      "cabinRestrictions": [
        {
          "cabin": "BUSINESS",
          "coverage": "MOST_SEGMENTS",
          "originDestinationIds": [
            "1"
          ]
        }
      ],
      "carrierRestrictions": {
        "excludedCarrierCodes": [
          "AA",
          "TP",
          "AZ"
        ]
      }
    }
  }
}
 * */
