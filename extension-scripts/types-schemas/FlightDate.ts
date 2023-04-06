import { z } from "zod"

export const FlightDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * @typedef FlightDate is the date in ISO 8601 format (YYYY-MM-DD)
 * 
 * */
export type FlightDate = z.infer<typeof FlightDateSchema>;