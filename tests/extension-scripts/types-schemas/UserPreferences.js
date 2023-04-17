import { z } from 'zod';
/**
 * User preferences specified in the popup
 * shared by background and content scripts
 *  */
function checkTimesAreConsistent(TimeWindowObject) {
    const $ = TimeWindowObject;
    if ($.latestDepartureTime && $.earliestDepartureTime && $.latestDepartureTime < $.earliestDepartureTime)
        return false;
    if ($.latestArrivalTime && $.earliestArrivalTime && $.latestArrivalTime < $.earliestArrivalTime)
        return false;
    return true;
}
const Time = z.number().min(0).max(24);
const TimeWindow = z.object({
    earliestDepartureTime: Time.default(0),
    latestDepartureTime: Time.default(24),
    earliestArrivalTime: Time.default(0),
    latestArrivalTime: Time.default(24)
}).refine(checkTimesAreConsistent, { message: 'Earliest departure/arrival time must be before latest departure/arrival time.' });
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
});
//# sourceMappingURL=UserPreferences.js.map