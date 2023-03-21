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
 * @param {number} infantsCount number of infants
 */
export type GuestCounter = z.infer<typeof guestCounterSchema>;

export const airbnbListingInfoSchema = z.object({
  destinationLocation: z.string(),
  outboundDate: z.date(),
  returnDate: z.date(),
  guestCounter: guestCounterSchema,
  currencyCode: z.string().regex(/^[A-Z]{3}$/)
}).refine((data) => data.outboundDate < data.returnDate, {
  message: "Outbound date must be before return date",
});

/**
 * @typedef airbnbListingInfo defines the destination location, outbound date, return date, guest counter and currency code
 * @param {string} destinationLocation is the destination location code
 * @param {Date} outboundDate is the outbound date
 * @param {Date} returnDate is the return date 
 * @param {GuestCounter} guestCounter inferred from the Airbnb page
 * @param {string} currencyCode inferred from the listing (ISO 4217 format)
 * */
export type AirbnbListingInfo = z.infer<typeof airbnbListingInfoSchema>;
