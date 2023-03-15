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
        time: "10:00:00"
      }
    }
  ],
  travelers: [
    {
      id: "1",
      travelerType: "ADULT"
    },
    {
      id: "2",
      travelerType: "CHILD"
    },
    {
      id: "3",
      travelerType: "CHILD"
    },
    {
      id: "4",
      travelerType: "CHILD"
    },
    {
      id: "5",
      travelerType: "CHILD"
    },
    {
      id: "6",
      travelerType: "CHILD"
    },
    {
      id: "7",
      travelerType: "CHILD"
    },
    {
      id: "8",
      travelerType: "CHILD"
    },
    {
      id: "9",
      travelerType: "CHILD"
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
      ],
      // carrierRestrictions: {
      //   excludedCarrierCodes: [],
      // },
    },
  },
};

const res = await amadeus.shopping.flightOffersSearch.post(JSON.stringify(flightSearchBody))

console.log(res.data[0])