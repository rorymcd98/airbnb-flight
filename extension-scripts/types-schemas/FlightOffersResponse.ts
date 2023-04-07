import { z } from "zod"
  //***************************************************//
 //*** Definition for a flightOffer Type and Schema **//
//***************************************************//
const FlightOfferSchema = z.object({
  type: z.string(),
  id: z.string(),
  source: z.string().optional(),
  instantTicketingRequired: z.boolean().optional(),
  nonHomogeneous: z.boolean().optional(),
  oneWay: z.boolean().optional(),
  lastTicketingDate: z.string().optional(),
  lastTicketingDateTime: z.string().optional(),
  itineraries: z.array(
    z.object({
      duration: z.string().optional(),
      segments: z.array(
        z.object({
          departure: z.object({
            iataCode: z.string().optional(),
            terminal: z.string().optional(),
            at: z.string().optional()
          }).optional(),
          arrival: z.object({
            iataCode: z.string().optional(),
            terminal: z.string().optional(),
            at: z.string().optional()
          }).optional(),
          carrierCode: z.string().optional(),
          number: z.string().optional(),
          aircraft: z.object({
            code: z.string()
          }).optional(),
          operating: z.object({
            carrierCode: z.string()
          }).optional(),
          id: z.string().optional(),
          numberOfStops: z.number().optional(),
          blacklistedInEU: z.boolean().optional()
        })
      ).optional()
    })
  ).optional(),
  price: z.object({
    currency: z.string().optional(),
    total: z.string().optional(),
    base: z.string().optional(),
    fees: z.array(
      z.object({
        amount: z.string().optional(),
        type: z.string().optional()
      })
    ).optional(),
    grandTotal: z.string().optional(),
    additionalServices: z.array(
      z.object({
        amount: z.string().optional(),
        type: z.string().optional()
      })
    ).optional()
  }).optional(),
  pricingOptions: z.object({
    fareType: z.array(z.string()).optional(),
    includedCheckedBagsOnly: z.boolean().optional()
  }).optional(),
  validatingAirlineCodes: z.array(z.string()).optional(),
  travelerPricings: z.array(
    z.object({
      travelerId: z.string().optional(),
      fareOption: z.string().optional(),
      travelerType: z.string().optional(),
      price: z.object({
        currency: z.string().optional(),
        total: z.string().optional(),
        base: z.string().optional()
      }).optional(),
      fareDetailsBySegment: z.array(
        z.object({
          segmentId: z.string().optional(),
          cabin: z.string().optional(),
          fareBasis: z.string().optional(),
          brandedFare: z.string().optional(),
          class: z.string().optional(),
          includedCheckedBags: z.object({
            quantity: z.number().optional()
          }).optional()
        })
      ).optional()
    })
  ).optional()
})

/**
 * @typedef FlightOffer for date and time range objects which are used for the departure and arrival time for originDesination objects
 * 
 * @remarks Check the documentation here https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search/api-reference
 * */
export type FlightOffer = z.infer<typeof FlightOfferSchema>;

  //********************************************//
 //*** Definition for a FlightOffersResponse  **//
//********************************************//
export const FlightOffersResponseSchema = z.object({
  warnings: z.array(z.any()).optional(),
  data: z.array(FlightOfferSchema),
  meta: z.object({
    count: z.number(),
    oneWayCombinations: z.array(z.any()).optional(),
  }).optional(),
  dictionaries: z.any().optional(),
})
/**
 * @typedef FlightOfferResponse received from the Amadeus API
 * 
 * @remarks Check the documentation here https://developers.amadeus.com/self-service/category/air/api-doc/flight-offers-search/api-reference 
 */
export type FlightOffersResponse = z.infer<typeof FlightOffersResponseSchema>;
