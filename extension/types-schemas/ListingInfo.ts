import { z } from "zod"

/**
 * Interfaces for Airbnb related data obtained from the DOM
 * shared by background and content scripts 
 *  */ 


const guestCounterSchema = z.object({
  adultsCount: z.number().min(1),
  childrenCount: z.number().min(0),
  infantsCount: z.number().min(0)
})

/**
 * @typedef guestCounter defines the number of adults, children and infants
 * @param {number} adultsCount number of adults (at least 1 required)
 * @param {number} childrenCount number of children
 * @param infantsCount number of infants
 */
export type GuestCounter = z.infer<typeof guestCounterSchema>;

export const airbnbListingInfoSchema = z.object({
  destinationLocation: z.string(),
  arrivalDate: z.date(),
  departureDate: z.date(),
  guestCounter: guestCounterSchema,
  currencyCode: z.string().regex(/^[A-Z]{3}$/)
}).refine((data) => data.arrivalDate < data.departureDate, {
  message: "Arrival date must be before departure date",
});

/**
 * @typedef airbnbListingInfo defines the destination location, arrival date, departure date, guest counter and currency code
 * @param {string} destinationLocation is the destination location code
 * @param {Date} arrivalDate is the arrival date
 * @param {Date} departureDate is the departure date 
 * @param {guestCounter} GuestCounter inferred from the Airbnb page
 * @param {string} currencyCode inferred from the listing (ISO 4217 format - defaults to USD)
 * */
export type AirbnbListingInfo = z.infer<typeof airbnbListingInfoSchema>;
