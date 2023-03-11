/**
 * Interfaces for Airbnb related data obtained from the DOM
 * shared by background and content scripts 
 *  */ 

export interface UserPreferences{
    departingLocation: string 
    returnFlight: boolean
    outboundOnly: boolean
    travelClass: string[]
    airlineWhiteList: string[]
    airlineBlackList: string[]
    maxStops: number
    maxPrice: number
    earliestDepartureTime: Time
    latestDepartureTime: Time
    earliestArrivalTime: Time
    latestArrivalTime: Time
}

export type Time = number;

export function isTime(val: number) val is Time{
    
}