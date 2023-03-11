/**
 * Interfaces for Airbnb related data obtained from the DOM
 * shared by background and content scripts 
 *  */ 

export interface GuestCounter {
  adultsCount: number
  childrenCount: number
  infantsCount: number
}

export interface AirbnbListingInfo {
  destinationLocation: string
  arrivalDate: Date
  departureDate: Date
  guestCounter: GuestCounter
  currencyCode: string
}
