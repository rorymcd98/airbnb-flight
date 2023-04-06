import { FlightOffer, generateFrontendOffersData } from '../find-cheapest-flights';


// var flightOffers: FlightOffer[] = await fetch('./find-cheapest-flight.test.json').then((response) => response.json());

import flightOffersJson from './find-cheapest-flight.test.json';

const flightOffers = flightOffersJson;

const listingInfo = {
  destinationLocation: 'London, United Kingdom',
  outboundDate: new Date('2023-04-13'),
  returnDate: new Date('2023-04-16'),
  guestCounter: {
    adultsCount: 2,
    childrenCount: 0,
    infantsCount: 0,
  },
  currencyCode: 'GBP'
};

const flightOffersData = generateFrontendOffersData(flightOffers, listingInfo);

//
import fs from 'fs';

export function main(){;
fs.writeFile('cheapestOffers.test.json', JSON.stringify(flightOffersData), (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
}

main();
