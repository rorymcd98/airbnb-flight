export type FlightOffer = {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating: {
        carrierCode: string;
      };
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
    additionalServices: Array<{
      amount: string;
      type: string;
    }>;
  };
  pricingOptions: {
    fareType: Array<string>;
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: Array<string>;
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
};

export type CheapestFlight = {
  flightDate: string;
  departureTime: string;
  arrivalTime: string;
  flightPrice: string;
  carrier: string;
};

export function findCheapestFlights(flightOffers: FlightOffer[]): Record<string, CheapestFlight | null> {
  const cheapestFlights: Record<string, CheapestFlight | null> = {};

  for (const flightOffer of flightOffers) {
    const departureDate = flightOffer.itineraries[0].segments[0].departure.at.split('T')[0];

    if (!cheapestFlights[departureDate] || parseFloat(flightOffer.price.total) < parseFloat(cheapestFlights[departureDate]!.flightPrice)) {
      cheapestFlights[departureDate] = {
        flightDate: departureDate,
        departureTime: flightOffer.itineraries[0].segments[0].departure.at,
        arrivalTime: flightOffer.itineraries[0].segments[0].arrival.at,
        flightPrice: flightOffer.price.total,
        carrier: flightOffer.itineraries[0].segments[0].carrierCode,
      };
    }
  }

  return cheapestFlights;
}