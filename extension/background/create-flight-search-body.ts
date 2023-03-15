import { z } from 'zod'
import { loadObjectFromFile } from './object-storage'
import { FlightSearchBodySchema } from '../types-schemas/FlightSearchBody'
import { AirbnbListingInfo } from '../types-schemas/ListingInfo'
import { UserPreferences } from '../types-schemas/UserPreferences'


// const obj = await loadObjectFromFile('./../response.json')

type FlightSearchBody = z.infer<typeof FlightSearchBodySchema>;


export const createFlightSearchBody = (userPreferences: UserPreferences, airbnbListingInfo: AirbnbListingInfo): FlightSearchBody => { 
  
  const mergedFlightSearchBody = {} as FlightSearchBody;



  return mergedFlightSearchBody;
}

