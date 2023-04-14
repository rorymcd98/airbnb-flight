import React from 'react'
import ReactDOM from 'react-dom/client'
import FlightOffersChart from '../flight-offers-chart/components/FlightOffersChart'

import FlightOffersData from '../../extension-scripts/background/background-tests/frontendOffersData.test.json'
const chartMeta = {
  currency: 'EUR',
  originLocation: 'London',
  destinationLocation: 'Spain',
  tripDuration: 7,
}


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className='dev-view w-screen h-screen inline-flex justify-center items-center'>
      <FlightOffersChart flightOffersData={FlightOffersData} chartMeta = {chartMeta} />
    </div>
  </React.StrictMode>,
)
