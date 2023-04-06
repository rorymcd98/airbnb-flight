import { z } from "zod";
import { FlightDateSchema } from "./FlightDate";
//***************************************************//
//*** Definition for DateTimeRange Type and Schema **//
//***************************************************//
const dateTimeRangeSchema = z.object({
    date: FlightDateSchema,
    dateWindow: z.string().regex(/^[MPI][1-3]D$/).optional(),
    time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
    timeWindow: z.string().regex(/^([1-9]|1[0-2])H$/).optional(),
});
//**********************************************//
//*** Definition for Traveler Type and Schema **//
//**********************************************//
const travelerSchemaWithoutHeldInfant = z.object({
    id: z.string(),
    travelerType: z.union([
        z.literal("ADULT"),
        z.literal("CHILD"),
        z.literal("SENIOR"),
        z.literal("YOUNG"),
        z.literal("SEATED_INFANT"),
        z.literal("STUDENT")
    ])
});
const travelerSchemaWithHeldInfant = z.object({
    id: z.string(),
    travelerType: z.literal("HELD_INFANT"),
    associatedAdultId: z.string()
});
const travelerSchema = z.union([travelerSchemaWithoutHeldInfant, travelerSchemaWithHeldInfant]);
/**
 * Refine function to check that seated infants have an associated adult
 */
//****************************************************//
//*** Definition for SearchCriteria Type and Schema **//
//****************************************************//
const searchCriteriaSchema = z.object({
    excludeAllotments: z.boolean().optional(),
    addOneWayOffers: z.boolean().optional(),
    maxFlightOffers: z.number().optional(),
    maxPrice: z.number().optional(),
    allowAlternativeFareOptions: z.boolean().optional(),
    oneFlightOfferPerDay: z.boolean().optional(),
    additionalInformation: z
        .object({
        chargeableCheckedBags: z.boolean().optional(),
        brandedFares: z.boolean().optional()
    })
        .optional(),
    pricingOptions: z
        .object({
        includedCheckedBagsOnly: z.boolean().optional(),
        refundableFaresOnly: z.boolean().optional(),
        noRestrictionFare: z.boolean().optional(),
        noPenaltyFare: z.boolean().optional()
    })
        .optional(),
    flightFilters: z
        .object({
        crossBorderAllowed: z.boolean().optional(),
        moreOvernightsAllowed: z.boolean().optional(),
        returnToDepartureAirport: z.boolean().optional(),
        railSegmentAllowed: z.boolean().optional(),
        busSegmentAllowed: z.boolean().optional(),
        maxFlightTime: z.number().optional(),
        carrierRestrictions: z
            .object({
            blacklistedInEUAllowed: z.boolean().optional(),
            excludedCarrierCodes: z.array(z.string()).optional(),
            includedCarrierCodes: z.array(z.string()).optional()
        })
            .optional(),
        cabinRestrictions: z
            .array(z.object({
            cabin: z
                .union([
                z.literal("ECONOMY"),
                z.literal("PREMIUM_ECONOMY"),
                z.literal("BUSINESS"),
                z.literal("FIRST")
            ])
                .optional(),
            coverage: z
                .union([
                z.literal("MOST_SEGMENTS"),
                z.literal("AT_LEAST_ONE_SEGMENT"),
                z.literal("ALL_SEGMENTS")
            ])
                .optional(),
            originDestinationIds: z.array(z.string()).optional()
        }))
            .optional(),
        connectionRestrictions: z
            .object({
            maxNumberOfConnections: z.number().optional(),
            nonStopPreferred: z.boolean().optional(),
            nonStopPreferredWeight: z.number().optional(),
            airportChangeAllowed: z.boolean().optional(),
            technicalStopsAllowed: z.boolean().optional()
        })
            .optional()
    })
        .optional()
});
//*******************************************************//
//*** Definition for originDestination Type and Schema **//
//*******************************************************//
/**
 * @typedef locationCode is a string which must be a valid IATA airport or city code (https://www.iata.org/en/publications/directories/code-search/)
 * */
const locationCode = z.string().regex(/^[A-Z]{3}$/);
const originDestinationSchema = z.object({
    id: z.string(),
    originLocationCode: locationCode.optional(),
    originRadius: z.number().min(0).max(300).optional(),
    alternativeOriginCodes: z.array(locationCode).min(1).max(2).optional(),
    destinationLocationCode: locationCode.optional(),
    destinationRadius: z.number().min(0).max(300).optional(),
    alternativeDestinationCodes: z.array(locationCode).min(1).max(2).optional(),
    departureDateTimeRange: dateTimeRangeSchema.optional(),
    arrivalDateTimeRange: dateTimeRangeSchema.optional(),
    includeConnectionPoints: z.array(locationCode).min(1).max(3).optional(),
    excludeConnectionPoints: z.array(locationCode).min(1).max(3).optional()
});
//******************************************************//
//*** Definition for FlightSearchBody Type and Schema **//
//******************************************************//
export const FlightSearchBodySchema = z.object({
    currencyCode: z.string().regex(/^[A-Z]{3}$/).optional(),
    originDestinations: z.array(originDestinationSchema).min(1).max(6).refine(checkOriginDestinationsAreChronological, { message: "The date/time of OriginDestination are not in chronological order." }).refine(checkNoDuplicatesId, generateDuplicateIdParams("originDestination")),
    travelers: z.array(travelerSchema).min(1).max(18).refine(checkNoDuplicatesId, generateDuplicateIdParams("traveler"))
        .refine(checkSeatedPassengersWithinLimits, { message: "The total number of seated passengers must be between 1 and 9." })
        .refine(checkEnoughAdultsPerInfants, { message: "At least 1 adult is needed per unseated infant." }),
    sources: z.tuple([z.literal("GDS")]),
    searchCriteria: searchCriteriaSchema.optional()
});
function checkNoDuplicatesId(arr) {
    const idSet = new Set();
    for (const obj of arr) {
        if (idSet.has(obj.id)) {
            return false; // Duplicate ID found
        }
        idSet.add(obj.id);
    }
    return true; // No duplicates found
}
function generateDuplicateIdParams(typeName) {
    return { message: `The id property of the ${typeName} objects must be unique.` };
}
function checkSeatedPassengersWithinLimits(travelers) {
    let totalSeatedPassengers = 0;
    for (const traveler of travelers) {
        if (traveler.travelerType !== "SEATED_INFANT") {
            totalSeatedPassengers++;
        }
    }
    return totalSeatedPassengers >= 1 && totalSeatedPassengers <= 9;
}
function checkChronological(date1, date2, time1, time2) {
    const dateObject1 = createDateObject(date1, time1);
    const dateObject2 = createDateObject(date2, time2);
    return dateObject1 < dateObject2;
    function createDateObject(date, time) {
        const dateObject = new Date(`${date} ${time ? time : "00:00"}`);
        return dateObject;
    }
}
//The API demands originDestinations are in chronological order
function checkOriginDestinationsAreChronological(originDestinations) {
    if (originDestinations.length === 1)
        return true;
    for (let i = 0; i < originDestinations.length - 1; i++) {
        const cur = originDestinations[i];
        const next = originDestinations[i + 1];
        const curDateTimeRange = cur.departureDateTimeRange ? cur.departureDateTimeRange : cur.arrivalDateTimeRange;
        const nextDateTimeRange = next.departureDateTimeRange ? next.departureDateTimeRange : next.arrivalDateTimeRange;
        if (!checkChronological(curDateTimeRange.date, nextDateTimeRange.date, curDateTimeRange.time, nextDateTimeRange.time)) {
            return false;
        }
    }
    return true;
}
function checkEnoughAdultsPerInfants(travelers) {
    const infants = travelers.filter(traveler => traveler.travelerType === "SEATED_INFANT" || traveler.travelerType === "HELD_INFANT");
    const adults = travelers.filter(traveler => traveler.travelerType === "ADULT");
    return adults.length >= infants.length;
}
