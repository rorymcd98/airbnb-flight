import Amadeus from 'amadeus'
import dotenv from 'dotenv'
dotenv.config()

const clientId: string | undefined = process.env.API_KEY
const clientSecret: string | undefined = process.env.API_SECRET

const amadeus = new Amadeus({
  clientId,
  clientSecret
})

amadeus.shopping.flightOffersSearch.get({
  originLocationCode: 'SYD',
  destinationLocationCode: 'BKK',
  departureDate: '2022-06-01',
  adults: '2'
}).then(function (response: any) {
  console.log(response.data)
}).catch(function (responseError: any) {
  console.log(responseError.code)
})
