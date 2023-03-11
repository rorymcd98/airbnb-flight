/**
 * Interface for flight offer query objects for amadeus
 * 
 *  */ 
export interface FlightSearchRequest {
    currencyCode?: string;
    originDestinations: OriginDestination[];
    travelers: Traveler[];
    sources: string[];
    searchCriteria?: SearchCriteria;
  }
  
export interface OriginDestination {
    id: string;
    originLocationCode: string;
    destinationLocationCode: string;
    departureDateTimeRange: {
      date: string;
      time: string;
    };
  }
  
export interface Traveler {
  id: string;
  travelerType: "ADULT" | "CHILD" | "INFANT";
  fareOptions?: string[];
}
  
export interface SearchCriteria {
  maxFlightOffers?: number;
  flightFilters?: {
    cabinRestrictions?: CabinRestriction[];
    carrierRestrictions?: {
      excludedCarrierCodes: string[];
    };
  };
}
  
export interface CabinRestriction {
  cabin: string;
  coverage: string;
  originDestinationIds: string[];
}



// {
//   "currencyCode": "USD",
//   "originDestinations": [
//     {
//       "id": "1",
//       "originLocationCode": "RIO",
//       "destinationLocationCode": "MAD",
//       "departureDateTimeRange": {
//         "date": "2020-03-01",
//         "time": "10:00:00"
//       }
//     },
//     {
//       "id": "2",
//       "originLocationCode": "MAD",
//       "destinationLocationCode": "RIO",
//       "departureDateTimeRange": {
//         "date": "2020-03-05",
//         "time": "17:00:00"
//       }
//     }
//   ],
//   "travelers": [
//     {
//       "id": "1",
//       "travelerType": "ADULT",
//       "fareOptions": [
//         "STANDARD"
//       ]
//     },
//     {
//       "id": "2",
//       "travelerType": "CHILD",
//       "fareOptions": [
//         "STANDARD"
//       ]
//     }
//   ],
//   "sources": [
//     "GDS"
//   ],
//   "searchCriteria": {
//     "maxFlightOffers": 50,
//     "flightFilters": {
//       "cabinRestrictions": [
//         {
//           "cabin": "BUSINESS",
//           "coverage": "MOST_SEGMENTS",
//           "originDestinationIds": [
//             "1"
//           ]
//         }
//       ],
//       "carrierRestrictions": {
//         "excludedCarrierCodes": [
//           "AA",
//           "TP",
//           "AZ"
//         ]
//       }
//     }
//   }
// }