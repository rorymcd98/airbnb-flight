import { z } from 'zod'
import dotenv from 'dotenv'
import { FlightSearchBody, FlightSearchBodySchema, DateTimeRange } from '../types-schemas/FlightSearchBody'
dotenv.config()

const clientId: string | undefined = process.env.API_KEY
const clientSecret: string | undefined = process.env.API_SECRET

const flightSearchBody: FlightSearchBody = {
  currencyCode: "USD",
  originDestinations: [
    {
      id: "1",
      originLocationCode: "LAX",
      destinationLocationCode: "NYC",
      departureDateTimeRange: {
        date: "2023-03-20",
        time: "23:59:59",
        timeWindow: "12H"
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
    maxFlightOffers: 24,
    flightFilters: {
      cabinRestrictions: [
        {
          cabin: "BUSINESS",
          originDestinationIds: ["1"],
        }
      ],
      connectionRestrictions: {
        maxNumberOfConnections: 0,
        nonStopPreferred: true,
        nonStopPreferredWeight: 100,
      },
      
    },
  },
};

import axios from 'axios';

const res = await searchFlightOffers(clientId, clientSecret, flightSearchBody);

const arr =[];

res.data.forEach((flightOffer: any) => {

  arr.push(flightOffer.travelerPricings[0].fareDetailsBySegment.length)

})

arr.sort()
console.log(arr.filter((el)=>{return el == 1}))

async function searchFlightOffers(clientId, clientSecret, requestBody) {
  const apiUrl = 'https://test.api.amadeus.com/v2/shopping/flight-offers';
  const p = await getAccessToken(clientId, clientSecret);

  try {
    const response = await axios.post(apiUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${p['access_token']}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`Failed to search for flight offers: ${error.message}`);
  }
}


async function getAccessToken(clientId, clientSecret) {
  const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  const data = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`;

  try {
    const response = await axios.post(tokenUrl, data, { headers });
    return response.data;
  } catch (error) {
    console.log(error);
  }
}