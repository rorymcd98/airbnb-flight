/**
 * User preferences specified in the popup
 * shared by background and content scripts 
 *  */ 

export interface IUserPreferences{
    departingLocation: string 
    searchOutboundFlight: boolean
    searchReturnFlight: boolean
    travelClass: string[]
    airlineWhiteList: string[]
    airlineBlackList: string[]
    maxStops: number
    maxPrice: number
    earliestDepartureTime: number
    latestDepartureTime: number
    earliestArrivalTime: number
    latestArrivalTime: number
}

