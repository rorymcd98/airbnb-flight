import Amadeus from 'amadeus'
import dotenv from 'dotenv'
import { IFlightSearchBody } from '../interfaces/FlightSearchBody'

dotenv.config()

const clientId: string | undefined = process.env.API_KEY
const clientSecret: string | undefined = process.env.API_SECRET

const amadeus = new Amadeus({
  clientId,
  clientSecret
})

const flightSearchBody: IFlightSearchBody = {
  currencyCode: "USD",
  originDestinations: [
    {
      id: "1",
      originLocationCode: "LAX",
      destinationLocationCode: "NYC",
      departureDateTimeRange: {
        date: "2023-03-20",
        time: "00:00:00",
      },
    },
  ],
  travelers: [
    {
      id: "ADT",
      travelerType: "ADULT"
    },
    {
      id: "CNN",
      travelerType: "CHILD"
    },
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