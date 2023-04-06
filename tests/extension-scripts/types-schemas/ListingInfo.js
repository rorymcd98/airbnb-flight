import { z } from "zod";
/**
 * Interfaces for Airbnb related data obtained from the DOM
 * shared by background and content scripts
 *  */
const guestCounterSchema = z.object({
    adultsCount: z.number().min(1),
    childrenCount: z.number().min(0),
    infantsCount: z.number().min(0)
});
export const airbnbListingInfoSchema = z.object({
    destinationLocation: z.string(),
    outboundDate: z.date(),
    returnDate: z.date(),
    guestCounter: guestCounterSchema,
    currencyCode: z.string().regex(/^[A-Z]{3}$/)
}).refine((data) => data.outboundDate < data.returnDate, {
    message: "Outbound date must be before return date",
});
