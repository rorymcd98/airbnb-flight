import { z } from 'zod'
import Amadeus from 'amadeus'
import dotenv from 'dotenv'
import { FlightSearchBody, FlightSearchBodySchema, DateTimeRange } from '../types-schemas/FlightSearchBody'
dotenv.config()

const clientId: string | undefined = process.env.API_KEY
const clientSecret: string | undefined = process.env.API_SECRET

const amadeus = new Amadeus({
  clientId,
  clientSecret
});

const flightSearchBody: FlightSearchBody = {
  currencyCode: "USD",
  originDestinations: [
    {
      id: "1",
      originLocationCode: "LAX",
      destinationLocationCode: "NYC",
      departureDateTimeRange: {
        date: "2023-03-20",
        time: "10:00:00",
        timeWindow: "1H"
      }
    }
  ],
  travelers: [
    {
      id: "1",
      travelerType: "ADULT"
    }
  ],
  sources: ["GDS"],
  searchCriteria: {
    maxFlightOffers: 50,
    flightFilters: {
      cabinRestrictions: [
        {
          cabin: "ECONOMY",
          coverage: "MOST_SEGMENTS",
          originDestinationIds: ["1"],
        },
      ]
    },
  },
};

const res = await amadeus.shopping.flightOffersSearch.post(JSON.stringify(flightSearchBody))

console.log(res.data.forEach((flightOffer: any) => {
  const arr =[];
  arr.push(flightOffer.itineraries[0].segments[0].departure.at)
  arr.sort()
  console.log(arr)
}))