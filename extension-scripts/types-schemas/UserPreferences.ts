import { z } from 'zod'

/**
 * User preferences specified in the popup
 * shared by background and content scripts
 *  */

function checkTimesAreConsistent (TimeWindowObject: any): boolean {
  const $ = TimeWindowObject
  if ($.latestDepartureTime && $.earliestDepartureTime && $.latestDepartureTime < $.earliestDepartureTime) return false
  if ($.latestArrivalTime && $.earliestArrivalTime && $.latestArrivalTime < $.earliestArrivalTime) return false
  return true
}

const Time = z.number().min(0).max(24)
const TimeWindow = z.object({
  earliestDepartureTime: Time.default(0),
  latestDepartureTime: Time.default(24),
  earliestArrivalTime: Time.default(0),
  latestArrivalTime: Time.default(24)
}).refine(checkTimesAreConsistent, { message: 'Earliest departure/arrival time must be before latest departure/arrival time.' })

export const userPreferencesSchema = z.object({
  originLocation: z.string(),
  searchOutboundFlight: z.boolean(),
  searchReturnFlight: z.boolean(),
  travelClass: z.union([z.literal('ECONOMY'), z.literal('PREMIUM_ECONOMY'), z.literal('BUSINESS'), z.literal('FIRST')]),
  //   airlineWhiteList: z.array(z.string()), //Currently removed as this is too granular (dev)
  //   airlineBlackList: z.array(z.string()),
  maxStops: z.number().optional().default(0),
  outboundTimeWindow: TimeWindow,
  returnTimeWindow: TimeWindow
})

/**
 * @typedef userPreferences defines the user preferences
 * @param {string} originLocation IATA airport or city location code specified by the user (https://www.iata.org/en/publications/directories/code-search/)
 * @param {boolean} searchOutboundFlight is a boolean indicating whether to search for outbound flights
 * @param {boolean} searchReturnFlight is a boolean indicating whether to search for return flights
 * @param {string[]} travelClass is an array of strings indicating the travel class
 * @param {string[]} airlineWhiteList is an array of strings indicating the airline whitelist
 * @param {string[]} airlineBlackList is an array of strings indicating the airline blacklist
 * @param {number} maxStops is the maximum number of stops
 * @param {number} earliestDepartureTime is the earliest departure time
 * @param {number} latestDepartureTime is the latest departure time
 * @param {number} earliestArrivalTime is the earliest arrival time
 * @param {number} latestArrivalTime is the latest arrival time
 * */
export type UserPreferences = z.infer<typeof userPreferencesSchema>
