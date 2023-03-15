import { z } from "zod"

/**
 * User preferences specified in the popup
 * shared by background and content scripts 
 *  */ 

function checkTimesAreConsistent(userPreferencesObject: any):boolean {
    const $ = userPreferencesObject;
    if ($.latestDepartureTime && $.earliestDepartureTime && $.latestDepartureTime < $.earliestDepartureTime) return false;
    if ($.latestArrivalTime && $.earliestArrivalTime && $.latestArrivalTime < $.earliestArrivalTime) return false;
    return true;
}

const Time = z.number().min(0).max(24).optional()

const TravelClass = z.object({
    ECONOMY: z.boolean(),
    PREMIUM_ECONOMY: z.boolean(),
    BUSINESS: z.boolean(),
    FIRST: z.boolean()
  }).refine(obj => Object.values(obj).some(val => val === true), {
    message: "At least one travel class must be selected."
  });
  

export const userPreferencesSchema = z.object({
  departingLocations: z.array(z.string().regex(/^[A-Z]{3}$/)).min(1),
  searchOutboundFlight: z.boolean(),
  searchReturnFlight: z.boolean(),
  travelClasses: TravelClass,
//   airlineWhiteList: z.array(z.string()), //Currently removed as this is too granular
//   airlineBlackList: z.array(z.string()),
  maxStops: z.number().optional().default(0),
  maxPrice: z.number().optional(),
  earliestDepartureTime: Time,
  latestDepartureTime: Time,
  earliestArrivalTime: Time,
  latestArrivalTime: Time
}).refine(checkTimesAreConsistent, {message: "Earliest departure/arrival time must be before latest departure/arrival time."})

/**
 * @typedef userPreferences defines the user preferences
 * @param {string} departingLocation IATA airport or city location code specified by the user (https://www.iata.org/en/publications/directories/code-search/)
 * @param {boolean} searchOutboundFlight is a boolean indicating whether to search for outbound flights
 * @param {boolean} searchReturnFlight is a boolean indicating whether to search for return flights
 * @param {string[]} travelClasses is an array of strings indicating the travel class
 * @param {string[]} airlineWhiteList is an array of strings indicating the airline whitelist
 * @param {string[]} airlineBlackList is an array of strings indicating the airline blacklist
 * @param {number} maxStops is the maximum number of stops
 * @param {number} maxPrice is the maximum price
 * @param {number} earliestDepartureTime is the earliest departure time
 * @param {number} latestDepartureTime is the latest departure time
 * @param {number} earliestArrivalTime is the earliest arrival time
 * @param {number} latestArrivalTime is the latest arrival time
 * */
export type UserPreferences = z.infer<typeof userPreferencesSchema>;