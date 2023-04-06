
import { z } from "zod"
import { FlightDateSchema } from "./FlightDate"


  //***************************************************//
 //*** Definition for DateTimeRange Type and Schema **//
//***************************************************//
const dateTimeRangeSchema = z.object({
  date: FlightDateSchema,
  dateWindow: z.string().regex(/^[MPI][1-3]D$/).optional(),
  time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  timeWindow: z.string().regex(/^([1-9]|1[0-2])H$/).optional(),
});
/**
 * @typedef DateTimeRange for date and time range objects which are used for the departure and arrival time for originDesination objects
 * 
 * @param {string} date is the date in ISO 8601 format (YYYY-MM-DD)
 * @param {string} dateWindow Pattern: ^[MPI][1-3]D ... M = -, P = +, I = +/- ... e.g. M3D = -3 days, P2D = +2 days, I1D = +/- 1 day
 * @param {string} time is the time in ISO 8601 format (HH:MM:SS)
 * @param {string} timeWindow Pattern: ^([1-9]|10|11|12)H ... e.g. 3H = +/- 3 hours
 * 
 * @remarks Cannot be combined with originRadius, or destinationRadius
 * */
export type DateTimeRange = z.infer<typeof dateTimeRangeSchema>;

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
})

const travelerSchemaWithHeldInfant = z.object({
  id: z.string(),
  travelerType: z.literal("HELD_INFANT"),
  associatedAdultId: z.string()
});

const travelerSchema = z.union([travelerSchemaWithoutHeldInfant, travelerSchemaWithHeldInfant]);

/**
 * @typedef Traveler defines who the passenger is for the purpose of ticket pricing (Traveler ID becomes associated with a originDestination object)
 * 
 * @param {string} id is a unique identifier for the traveler which becomes associated with an originDestination object
 * @param {string} travelerType is the type of traveler (age restrictions are: CHILD < 12y, HELD_INFANT < 2y, SEATED_INFANT < 2y, SENIOR >=60y)
 * @param {string} associatedAdultId is the id of the associated adult traveler for a HELD_INFANT
 */
export type Traveler = z.infer<typeof travelerSchema>;

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
        .array(
          z.object({
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
          })
        )
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
})

/**
 * @typedef SearchCriteria defines the max number of flight offers to return and the flight filters (cabin restrictions and carrier restrictions)
 * 
 * @remarks Entirely optional, I will backfill this depending on which are used (dev)
 * */
export type SearchCriteria = z.infer<typeof searchCriteriaSchema>;



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
})
/**
 * @typedef originDestination defines a pair of origins and destinatons which a traveller may fly between - including information about the departure and arrival date and time, location code, and options for alternative locations
 * 
 * @remarks originRadius and destinationRadisu annot be combined with originRadius, or destinationRadius
 * 
 * @param {string} id is a unique identifier for the origin and destination
 * @param {locationCode} originLocationCode is the City or Airport origin location code
 * @param {number} originRadius is the radius to search for alternative locations from the originLocationCode (in km, up to 300km) 
 * @param {string[]} alternativeOriginCodes is an array of alternative origin location codes
 * @param {string} destinationLocationCode is the destination location code (as above)
 * @param {number} destinationRadius is the radius to search for alternative locations from the destinationLocationCode (in km, up to 300km)
 * @param {string[]} alternativeDestinationCodes is an array of alternative destination location codes
 * @param {DateTimeRange} departureDateTimeRange is an object that contains the departure date and time (date and time are in ISO 8601 format,  YYYY-MM-DD)
 * @param {DateTimeRange} arrivalDateTimeRange is an object that contains the arrival date and time (date and time are in ISO 8601 format, YYYY-MM-DD)
 * @param {string[]} includeConnectionPoints is an array of location codes to include as connection points
 * @param {string[]} excludeConnectionPoints is an array of location codes to exclude as connection points
 *  */ 
export type OriginDestination = z.infer<typeof originDestinationSchema>;

  //******************************************************//
 //*** Definition for FlightSearchBody Type and Schema **//
//******************************************************//
export const FlightSearchBodySchema = z.object({
  currencyCode: z.string().regex(/^[A-Z]{3}$/).optional(),
  originDestinations: z.array(originDestinationSchema).min(1).max(6).refine(checkOriginDestinationsAreChronological, {message: "The date/time of OriginDestination are not in chronological order."}).refine(checkNoDuplicatesId, generateDuplicateIdParams("originDestination")),
  travelers: z.array(travelerSchema).min(1).max(18).refine(checkNoDuplicatesId, generateDuplicateIdParams("traveler"))
                                    .refine(checkSeatedPassengersWithinLimits, {message: "The total number of seated passengers must be between 1 and 9."})
                                    .refine(checkEnoughAdultsPerInfants, {message: "At least 1 adult is needed per unseated infant."}),
  sources: z.tuple([z.literal("GDS")]),
  searchCriteria: searchCriteriaSchema.optional()
})

/**
 * @typedef FlightSearchBody defines the shape of the flight offers search POST request body
 * @param {string} currencyCode for flight prices (ISO 4217 format - defaults to USD) - inferred from Airbnb listing
 * @param {OriginDestination[]} originDestinations array of OriginDestination objects (min: 1, max: 6)
 * @param {Traveler[]} travelers an array of traveler objects (min: 1, max: 18)
 * @param {string[]} sources is an array of strings that contain the source of the flight offer (currently only "GDS")
 * @param {SearchCriteria} searchCriteria is an object that contains the max flight offers and flight filters (cabin restrictions and carrier restrictions)
 *  */ 
export type FlightSearchBody = z.infer<typeof FlightSearchBodySchema>;

/**
 * Refinement functions for FlightSearchBody schema
 */
interface HasId {
  id: string;
  [key: string]: any;
}
function checkNoDuplicatesId<T extends HasId>(arr: T[]): boolean {
  const idSet = new Set<string>();
  for (const obj of arr) {
    if (idSet.has(obj.id)) {
      return false; // Duplicate ID found
    }
    idSet.add(obj.id);
  }
  return true; // No duplicates found
}

function generateDuplicateIdParams(typeName: string): {message: string} {
  return {message: `The id property of the ${typeName} objects must be unique.`}
}

function checkSeatedPassengersWithinLimits(travelers: Traveler[]): boolean {
  let totalSeatedPassengers = 0;
  for (const traveler of travelers) {
    if (traveler.travelerType !== "SEATED_INFANT") {
      totalSeatedPassengers++;
    }
  }
  return totalSeatedPassengers >= 1 && totalSeatedPassengers <= 9;
}

function checkChronological (date1: string, date2: string, time1?: string, time2?: string): boolean{
  const dateObject1 = createDateObject(date1, time1);
  const dateObject2 = createDateObject(date2, time2);
  return dateObject1 < dateObject2;

  function createDateObject (date: string, time?: string): Date{
    const dateObject = new Date(`${date} ${time ? time : "00:00"}`);
    return dateObject;
  }
}
//The API demands originDestinations are in chronological order
function checkOriginDestinationsAreChronological (originDestinations: OriginDestination[]): boolean {
  if (originDestinations.length === 1) return true;
  for (let i = 0; i < originDestinations.length - 1; i++) {
    const cur = originDestinations[i];
    const next = originDestinations[i + 1];
    const curDateTimeRange = cur.departureDateTimeRange ? cur.departureDateTimeRange! : cur.arrivalDateTimeRange!;
    const nextDateTimeRange = next.departureDateTimeRange ? next.departureDateTimeRange! : next.arrivalDateTimeRange!;

    if (!checkChronological(curDateTimeRange.date, nextDateTimeRange.date, curDateTimeRange.time, nextDateTimeRange.time)) {
      return false;
    }
  }
  return true;
}

function checkEnoughAdultsPerInfants (travelers: Traveler[]): boolean {
  const infants = travelers.filter(traveler => traveler.travelerType === "SEATED_INFANT" || traveler.travelerType === "HELD_INFANT");
  const adults = travelers.filter(traveler => traveler.travelerType === "ADULT");
  return adults.length >= infants.length;
}