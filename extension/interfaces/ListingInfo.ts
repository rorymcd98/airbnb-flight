/**
 * Interfaces for Airbnb related data obtained from the DOM
 * shared by background and content scripts 
 *  */ 

interface IGuestCounter {
  adultsCount: number
  childrenCount: number
  infantsCount: number
}

export interface IAirbnbListingInfo {
  destinationLocation: string
  arrivalDate: Date
  departureDate: Date
  guestCounter: IGuestCounter
  currencyCode: string
}
