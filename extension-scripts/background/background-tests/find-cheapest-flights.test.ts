import { FlightOffer, findCheapestFlights } from '../find-cheapest-flights';
import {describe, test, expect} from '@jest/globals';

const flightOffers: Record<string, FlightOffer> = [
  {
      "type": "flight-offer",
      "id": "1",
      "source": "GDS",
      "instantTicketingRequired": false,
      "nonHomogeneous": false,
      "oneWay": false,
      "lastTicketingDate": "2023-04-03",
      "lastTicketingDateTime": "2023-04-03",
      "numberOfBookableSeats": 9,
      "itineraries": [
          {
              "duration": "PT5H55M",
              "segments": [
                  {
                      "departure": {
                          "iataCode": "LGW",
                          "terminal": "S",
                          "at": "2023-07-10T13:50:00"
                      },
                      "arrival": {
                          "iataCode": "CPH",
                          "terminal": "3",
                          "at": "2023-07-10T16:40:00"
                      },
                      "carrierCode": "D8",
                      "number": "3515",
                      "aircraft": {
                          "code": "73H"
                      },
                      "operating": {
                          "carrierCode": "D8"
                      },
                      "duration": "PT1H50M",
                      "id": "1",
                      "numberOfStops": 0,
                      "blacklistedInEU": false
                  },
                  {
                      "departure": {
                          "iataCode": "CPH",
                          "terminal": "2",
                          "at": "2023-07-10T18:10:00"
                      },
                      "arrival": {
                          "iataCode": "FCO",
                          "terminal": "1",
                          "at": "2023-07-10T20:45:00"
                      },
                      "carrierCode": "D8",
                      "number": "3732",
                      "aircraft": {
                          "code": "73H"
                      },
                      "operating": {
                          "carrierCode": "D8"
                      },
                      "duration": "PT2H35M",
                      "id": "2",
                      "numberOfStops": 0,
                      "blacklistedInEU": false
                  }
              ]
          },
          {
              "duration": "PT9H45M",
              "segments": [
                  {
                      "departure": {
                          "iataCode": "FCO",
                          "terminal": "1",
                          "at": "2023-07-23T10:50:00"
                      },
                      "arrival": {
                          "iataCode": "ARN",
                          "terminal": "5",
                          "at": "2023-07-23T14:00:00"
                      },
                      "carrierCode": "D8",
                      "number": "4356",
                      "aircraft": {
                          "code": "73H"
                      },
                      "operating": {
                          "carrierCode": "D8"
                      },
                      "duration": "PT3H10M",
                      "id": "3",
                      "numberOfStops": 0,
                      "blacklistedInEU": false
                  },
                  {
                      "departure": {
                          "iataCode": "ARN",
                          "terminal": "5",
                          "at": "2023-07-23T17:45:00"
                      },
                      "arrival": {
                          "iataCode": "LGW",
                          "terminal": "S",
                          "at": "2023-07-23T19:35:00"
                      },
                      "carrierCode": "D8",
                      "number": "4459",
                      "aircraft": {
                          "code": "73H"
                      },
                      "operating": {
                          "carrierCode": "D8"
                      },
                      "duration": "PT2H50M",
                      "id": "4",
                      "numberOfStops": 0,
                      "blacklistedInEU": false
                  }
              ]
          }
      ],
      "price": {
          "currency": "GBP",
          "total": "141.97",
          "base": "65.00",
          "fees": [
              {
                  "amount": "0.00",
                  "type": "SUPPLIER"
              },
              {
                  "amount": "0.00",
                  "type": "TICKETING"
              }
          ],
          "grandTotal": "141.97",
          "additionalServices": [
              {
                  "amount": "80.80",
                  "type": "CHECKED_BAGS"
              }
          ]
      },
      "pricingOptions": {
          "fareType": [
              "PUBLISHED"
          ],
          "includedCheckedBagsOnly": false
      },
      "validatingAirlineCodes": [
          "DY"
      ],
      "travelerPricings": [
          {
              "travelerId": "1",
              "fareOption": "STANDARD",
              "travelerType": "ADULT",
              "price": {
                  "currency": "GBP",
                  "total": "141.97",
                  "base": "65.00"
              },
              "fareDetailsBySegment": [
                  {
                      "segmentId": "1",
                      "cabin": "ECONOMY",
                      "fareBasis": "QCALF",
                      "brandedFare": "LOWFARE",
                      "class": "Q",
                      "includedCheckedBags": {
                          "quantity": 0
                      }
                  },
                  {
                      "segmentId": "2",
                      "cabin": "ECONOMY",
                      "fareBasis": "QHCALF",
                      "brandedFare": "LOWFARE",
                      "class": "Q",
                      "includedCheckedBags": {
                          "quantity": 0
                      }
                  },
                  {
                      "segmentId": "3",
                      "cabin": "ECONOMY",
                      "fareBasis": "QHCALF",
                      "brandedFare": "LOWFARE",
                      "class": "Q",
                      "includedCheckedBags": {
                          "quantity": 0
                      }
                  },
                  {
                      "segmentId": "4",
                      "cabin": "ECONOMY",
                      "fareBasis": "QCALF",
                      "brandedFare": "LOWFARE",
                      "class": "Q",
                      "includedCheckedBags": {
                          "quantity": 0
                      }
                  }
              ]
          }
      ]
  },
  {
    "type": "flight-offer",
    "id": "1",
    "source": "GDS",
    "instantTicketingRequired": false,
    "nonHomogeneous": false,
    "oneWay": false,
    "lastTicketingDate": "2023-04-03",
    "lastTicketingDateTime": "2023-04-03",
    "numberOfBookableSeats": 9,
    "itineraries": [
        {
            "duration": "PT5H55M",
            "segments": [
                {
                    "departure": {
                        "iataCode": "LGW",
                        "terminal": "S",
                        "at": "2023-07-10T13:50:00"
                    },
                    "arrival": {
                        "iataCode": "CPH",
                        "terminal": "3",
                        "at": "2023-07-10T16:40:00"
                    },
                    "carrierCode": "D8",
                    "number": "3515",
                    "aircraft": {
                        "code": "73H"
                    },
                    "operating": {
                        "carrierCode": "D8"
                    },
                    "duration": "PT1H50M",
                    "id": "1",
                    "numberOfStops": 0,
                    "blacklistedInEU": false
                },
                {
                    "departure": {
                        "iataCode": "CPH",
                        "terminal": "2",
                        "at": "2023-07-10T18:10:00"
                    },
                    "arrival": {
                        "iataCode": "FCO",
                        "terminal": "1",
                        "at": "2023-07-10T20:45:00"
                    },
                    "carrierCode": "D8",
                    "number": "3732",
                    "aircraft": {
                        "code": "73H"
                    },
                    "operating": {
                        "carrierCode": "D8"
                    },
                    "duration": "PT2H35M",
                    "id": "2",
                    "numberOfStops": 0,
                    "blacklistedInEU": false
                }
            ]
        },
        {
            "duration": "PT9H45M",
            "segments": [
                {
                    "departure": {
                        "iataCode": "FCO",
                        "terminal": "1",
                        "at": "2023-07-23T10:50:00"
                    },
                    "arrival": {
                        "iataCode": "ARN",
                        "terminal": "5",
                        "at": "2023-07-23T14:00:00"
                    },
                    "carrierCode": "D8",
                    "number": "4356",
                    "aircraft": {
                        "code": "73H"
                    },
                    "operating": {
                        "carrierCode": "D8"
                    },
                    "duration": "PT3H10M",
                    "id": "3",
                    "numberOfStops": 0,
                    "blacklistedInEU": false
                },
                {
                    "departure": {
                        "iataCode": "ARN",
                        "terminal": "5",
                        "at": "2023-07-23T17:45:00"
                    },
                    "arrival": {
                        "iataCode": "LGW",
                        "terminal": "S",
                        "at": "2023-07-23T19:35:00"
                    },
                    "carrierCode": "D8",
                    "number": "4459",
                    "aircraft": {
                        "code": "73H"
                    },
                    "operating": {
                        "carrierCode": "D8"
                    },
                    "duration": "PT2H50M",
                    "id": "4",
                    "numberOfStops": 0,
                    "blacklistedInEU": false
                }
            ]
        }
    ],
    "price": {
        "currency": "GBP",
        "total": "100.00",
        "base": "65.00",
        "fees": [
            {
                "amount": "0.00",
                "type": "SUPPLIER"
            },
            {
                "amount": "0.00",
                "type": "TICKETING"
            }
        ],
        "grandTotal": "141.97",
        "additionalServices": [
            {
                "amount": "80.80",
                "type": "CHECKED_BAGS"
            }
        ]
    },
    "pricingOptions": {
        "fareType": [
            "PUBLISHED"
        ],
        "includedCheckedBagsOnly": false
    },
    "validatingAirlineCodes": [
        "DY"
    ],
    "travelerPricings": [
        {
            "travelerId": "1",
            "fareOption": "STANDARD",
            "travelerType": "ADULT",
            "price": {
                "currency": "GBP",
                "total": "100.97",
                "base": "65.00"
            },
            "fareDetailsBySegment": [
                {
                    "segmentId": "1",
                    "cabin": "ECONOMY",
                    "fareBasis": "QCALF",
                    "brandedFare": "LOWFARE",
                    "class": "Q",
                    "includedCheckedBags": {
                        "quantity": 0
                    }
                },
                {
                    "segmentId": "2",
                    "cabin": "ECONOMY",
                    "fareBasis": "QHCALF",
                    "brandedFare": "LOWFARE",
                    "class": "Q",
                    "includedCheckedBags": {
                        "quantity": 0
                    }
                },
                {
                    "segmentId": "3",
                    "cabin": "ECONOMY",
                    "fareBasis": "QHCALF",
                    "brandedFare": "LOWFARE",
                    "class": "Q",
                    "includedCheckedBags": {
                        "quantity": 0
                    }
                },
                {
                    "segmentId": "4",
                    "cabin": "ECONOMY",
                    "fareBasis": "QCALF",
                    "brandedFare": "LOWFARE",
                    "class": "Q",
                    "includedCheckedBags": {
                        "quantity": 0
                    }
                }
            ]
        }
    ]
}
];

describe('findCheapestFlights', () => {
  test('should return the cheapest flights for each departure date', () => {
    const cheapestFlights = findCheapestFlights(flightOffers);

    // Replace the expected values wtesth the correct values based on your flightOffers data
    expect(cheapestFlights['2023-05-13']).toEqual({
      flightDate: '2023-05-13',
      departureTime: '2023-05-13T20:00:00',
      arrivalTime: '2023-05-13T23:30:00',
      flightPrice: '128.20',
      carrier: 'AZ',
    });

    expect(cheapestFlights['2023-05-14']).toEqual({
      flightDate: '2023-05-14',
      departureTime: '2023-05-14T20:00:00',
      arrivalTime: '2023-05-14T23:30:00',
      flightPrice: '110.00',
      carrier: 'BA',
    });

    expect(cheapestFlights['2023-05-15']).toBeNull();
  });
});

// {
//   "2023-07-10": {
//     "flightDate": "2023-07-10",
//     "departureTime": "2023-07-10T13:50:00",
//     "arrivalTime": "2023-07-10T20:45:00",
//     "flightPrice": "100.00",
//     "carrier": "D8"
//   },
//   "2023-07-23": {
//     "flightDate": "2023-07-23",
//     "departureTime": "2023-07-23T10:50:00",
//     "arrivalTime": "2023-07-23T19:35:00",
//     "flightPrice": "100.00",
//     "carrier": "D8"
//   }
// }