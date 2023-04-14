import React, { useRef, useEffect, useState } from 'react';
import zoomPlugin from 'chartjs-plugin-zoom';
import { FrontendChartData } from '../../../extension-scripts/background/generate-frontend-chart';
import getSymbolFromCurrency from 'currency-symbol-map';
import { ChartMeta } from '../../../extension-scripts/background/generate-frontend-chart';

import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

interface FlightDataChartProps {
  flightOffersData: FrontendChartData;
  chartMeta: ChartMeta
}

function formatDate(flightDate: string) {
  const numToDate = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const dateArray = flightDate.split('-');
  const month = numToDate[parseInt(dateArray[1]) - 1];
  const day = dateArray[2];

  return `${month} ${day}`;
}

const FlightOffersChart: React.FC<FlightDataChartProps> = ({flightOffersData, chartMeta}) => {
  const [selectedOutboundDate, setSelectedOutboundDate] = useState<string | null>(null);
  const currencySymbol = getSymbolFromCurrency(chartMeta.currency);

  const handleBarClick = (outboundDate: string) => {
    setSelectedOutboundDate(outboundDate);
  };

  const handleBackClick = () => {
    setSelectedOutboundDate(null);
  };

  let options;
  let data;
  let flightOffersChart;

  const dates = new Map();    
  Object.values(flightOffersData).forEach((flightOffersGroup) => {
    Object.keys(flightOffersGroup).forEach((key) => {dates.set(key, true)});
  });
  const sortedDates = Array.from(dates.keys()).sort();
  const formattedDates = sortedDates.map((date) => formatDate(date));

  options = {
    plugins: {
      title: {
        display: true,
        text: `Flights from ${chartMeta.originLocation} to ${chartMeta.destinationLocation}`,
        font: {
          size: 20,
        }
      },
    zoom: {
      pan: {
          enabled: true,
          mode: 'x'
      },
      zoom: {
          pinch: {
              enabled: true       // Enable pinch zooming
          },
          wheel: {
              enabled: true       // Enable wheel zooming
          },
          mode: 'x',
        }
      }
    },
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    aspectRatio: 0.65,
    scales: {
      x: {
      },
      y: {
        ticks: {
          callback: function(value, index, ticks) {
              return currencySymbol + value;
          }
        }
      },
    },
    onClick: (_event, activeEls) => {
      let dataIndex = activeEls[0].index;
      const outboundDate = sortedDates[dataIndex];
      if(flightOffersData.cheapestFlightOutboundReturn[outboundDate]){
        handleBarClick(outboundDate);
      } else {
        //Show some sort of warning to the user also
        console.warn('No flight offers for this date');
        return;
      }
    } 
  };

  if (selectedOutboundDate === null) {
      const tripDurationOffers = flightOffersData.cheapestFlightsTripDuration;
      const anyDurationOffers = flightOffersData.cheapestFlightsAnyDuration;

      data = {
        labels: formattedDates,
        datasets: [
        {
          label: `Cheapest flights`,
          data: Object.keys(anyDurationOffers).map((date) => anyDurationOffers[date]?.flightPrice),
          backgroundColor: 'rgba(255, 99, 132, 1)',
          order: 0
        }
        ]
      }

      if (typeof chartMeta.tripDuration === 'number' && chartMeta.tripDuration > 0){
        data.datasets.push({
          label: `${chartMeta.tripDuration} day trips`,
          data: Object.keys(tripDurationOffers).map((date) => tripDurationOffers[date]?.flightPrice),
          backgroundColor: 'rgba(122, 122, 122, 0.2)',
          grouped: false,
          order: 1
        })
      }

      flightOffersChart = 
      <Bar 
        data={data}
        options={options}
      />

    } else {
      const flightOffersOnDate = flightOffersData.cheapestFlightOutboundReturn[selectedOutboundDate];
      if (flightOffersOnDate === undefined) {
        //We should not end up here due to earlier undefined checks, but just in case...
        handleBackClick();
      }

      const sortedReturnDates = Object.keys(flightOffersOnDate).sort();
      const indexOfOutboundDate = sortedReturnDates.indexOf(selectedOutboundDate);
      const returnDatesAfterOutbound = sortedReturnDates.slice(indexOfOutboundDate);
      
      const formattedReturnDates = returnDatesAfterOutbound.map((date) => formatDate(date));
      const priceData = sortedReturnDates.map((date) => flightOffersOnDate[date]?.flightPrice);

      data = {
        labels: formattedReturnDates,
        datasets: [{
          label: `Flights leaving on ${formatDate(selectedOutboundDate)}`,
          data: priceData,
          backgroundColor: 'rgba(255, 99, 132, 1)',
          grouped: false,
          order: 1
        }]
      }
      flightOffersChart = 
      <Bar 
        data={data}
        options={options}
        style={{display: 'flex'}}
      />    
    }

  return (
    <div className="bg-gray-200  p-3 rounded-md shadow-xl border-2 border-red-500">
      <div className="flex justify-end items-center">
        {selectedOutboundDate && (
          <button
            className="flex items-center justify-center w-8 h-8 ml-4 rounded-full text-gray-700 
                      bg-white hover:bg-gray-100 backButton"
            onClick={handleBackClick}
          >
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H6M12 5l-7 7 7 7"/></svg>
          </button>
        )}
        <button
          className="flex items-center justify-center w-8 h-8 ml-1 rounded-full text-gray-700
                    bg-white hover:bg-gray-100 closeButton"
          onClick={() => console.log("close")}
        >
          <svg
            className="w-4 h-4 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M12.04 10l4.78-4.77a1.25 1.25 0 10-1.77-1.77L10.267 8.23 
                5.49 3.45a1.25 1.25 0 10-1.77 1.77L8.523 10l-4.06 4.06a1.25 1.25 
                0 001.768 1.768L10.044 11.23l4.777 4.78a1.25 1.25 0 101.768-1.768L12.04 
                10z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {flightOffersChart}
    </div>
  );
};

export default FlightOffersChart;