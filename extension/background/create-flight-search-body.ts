import { loadObjectFromFile } from './object-storage'
import { IFlightSearchBody } from '../interfaces/FlightSearchBody'
import { IAirbnbListingInfo } from '../interfaces/ListingInfo'
import { IUserPreferences } from '../interfaces/UserPreferences'

// const obj = await loadObjectFromFile('./../response.json')

export const createFlightSearchBody = (userPreferences: IUserPreferences, airbnbListingInfo: IAirbnbListingInfo): IFlightSearchBody => { 
  
  const mergedFlightSearchBody = {} as IFlightSearchBody;

  return mergedFlightSearchBody;

}

