import React, { useEffect, useState } from 'react'
import { usePost } from '../hooks/usePost'
import { useParams } from 'react-router-dom'
import { useGet } from '../hooks/useGet'
import useAutoFetch from '../hooks/useAutoFetch'

import Chart from "react-apexcharts";
import MyBarChart from '../components/MyBarChart';


const MerchantDetails = () => {
  const { id } = useParams();
 const {data:record} = useGet(`/Merchant-Collection?merchant_id=${id}`);
// console.log("records data: ",record);
 const {data:getMerchant} = useGet(`/show-merchant/${id}`);
 const chartCount  =record?.transactionStatusCounts || {};
 const [filter,setFilter] =  useState('payin');

// const chartSeries = chartCount
//   ? [
//       chartCount.pending ?? 0,
//       chartCount.success ?? 0,
//       chartCount.initiated ?? 0,
//     ]
//   : [0, 0, 0];


const chartSeries = filter === 'payin'
  ? [
      record?.payinTransactionStatusCounts?.pending ?? 0,
      record?.payinTransactionStatusCounts?.success ?? 0,
      record?. payinTransactionStatusCounts ?.initiated ?? 0,
    ]
  : [
      record?.payoutTransactionStatusCounts?.pending ?? 0,
      record?.payoutTransactionStatusCounts?.success ?? 0,
      record?.payoutTransactionStatusCounts?.initiated ?? 0,
    ];



const chartLabels = ["Pending", "Success", "Initiated"];
// const pieOptions = {
//   chart: {
//     type: 'donut',
//         dropShadow: {
//       enabled: true, // adds shadow for depth
//       top: 10,
//       left: 0,
//       blur: 10,
//       opacity: 0.3,
//     },
//   },
//   labels: ["Pending", "Success", "Initiated"], // This is REQUIRED for pie charts
//    colors: ['#FFC107', '#4CAF50', '#F44336'], // yellow, green, red
//   legend: {
//     position: "bottom",
//   },
//   responsive: [{
//     breakpoint: 480,
//     options: {
//       chart: {
//         width: 300
//       },
//       legend: {
//         position: "bottom"
//       }
//     }
//   }]
// };

const pieOptions = {
  chart: {
    type: 'donut',
    background: '#ffffff', // light theme
    dropShadow: {
      enabled: true,
      top: 5,
      left: 0,
      blur: 8,
      opacity: 0.2,
    },
  },
  labels: ["Pending", "Success", "Initiated"],
  colors: ['#b9a358ff', '#006400', '#E57373'], // Success = dark green (#006400)
  legend: {
    position: "bottom",
    labels: {
      colors: '#555',
    },
  },
  plotOptions: {
    pie: {
      startAngle: -90,
      endAngle: 270, // tilt for 3D effect
      donut: {
        size: '65%',
        background: 'transparent',
        labels: {
          show: true,
          name: { show: true, color: '#333' },
          value: { show: true, color: '#333' },
        },
      },
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: ['#cc9e09ff', '#004d00', '#EF9A9A'], 
      // Success gradient = dark green (#004d00)
      inverseColors: false,
      // opacityFrom: 0.9,
      // opacityTo: 0.7,
      stops: [0, 100],
    },
  },
  tooltip: {
    theme: 'light',
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 300 },
        legend: { position: "bottom" },
      },
    },
  ],
};



 console.log("record data",record);;



  return (
   <div className="p-4">
      <div className="flex items-center justify-between mb-6">

      <h1 className="text-xl font-bold mb-4">Merchant Details</h1>
      {/* <label className="block text-gray-600 text-sm font-medium mb-1">Select Type</label> */}
 <div className="relative inline-flex items-center bg-gray-100 rounded-full p-1 w-64">
  <div
    className={`absolute top-1 bottom-1 left-1 w-1/2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-transform duration-500 ease-out shadow-lg
      ${filter === 'payout' ? 'translate-x-full' : 'translate-x-0'}`}
  />
  {['payin', 'payout'].map((type) => (
    <button
      key={type}
      onClick={() => setFilter(type)}
      className="relative z-10 w-1/2 py-3 text-center font-medium capitalize transition-colors duration-300"
    >
      <span className={filter === type ? 'text-white' : 'text-gray-600'}>
        {type}
      </span>
    </button>
  ))}
</div>
      </div>
        
      {/* Cards */}
      {record && (
        <>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
  {filter === 'payin' && (
    <>
      {/* Expected Payin */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Expected Payin</h3>
        <p className="text-3xl font-bold text-blue-600">₹ {record.todayPayingAmount}</p>
      </div>

      {/* Payin Wallet */}
      <div className="bg-gradient-to-r from-green-100 to-green-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Payin Wallet</h3>
        <p className="text-3xl font-bold text-green-600">₹ {record.PayingAmount}</p>
      </div>

      {/* Total Profit */}
      <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Profit</h3>
        <p className="text-3xl font-bold text-yellow-600">₹ {record.PayinProfitAmount}</p>
      </div>

      {/* Total Payin */}
      <div className="bg-gradient-to-r from-purple-100 to-purple-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Payin</h3>
        <p className="text-3xl font-bold text-purple-600">₹ {record.total_payin_amount}</p>
      </div>
    </>
  )}

  {filter === 'payout' && (
    <>
      {/* Total Payout */}
      <div className="bg-gradient-to-r from-red-100 to-red-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Total Payout</h3>
        <p className="text-3xl font-bold text-red-600">₹ {record.total_payout_amount}</p>
      </div>

      {/* Today's Payout */}
      <div className="bg-gradient-to-r from-pink-100 to-pink-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Today's Payout</h3>
        <p className="text-3xl font-bold text-pink-600">₹ {record.today_payout}</p>
      </div>

      {/* Payout Wallet */}
      <div className="bg-gradient-to-r from-purple-100 to-purple-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Payout Wallet</h3>
        <p className="text-3xl font-bold text-purple-600">₹ {record.payout_wallet}</p>
      </div>

      {/* Payout Refunded */}
      <div className="bg-gradient-to-r from-orange-100 to-orange-50 shadow-lg rounded-2xl p-6 hover:scale-105 transform transition duration-300 ease-in-out">
        <h3 className="text-gray-600 text-sm font-medium mb-2">Refunded</h3>
        <p className="text-3xl font-bold text-orange-600">₹ {record.refund_amount}</p>
      </div>
    </>
  )}
</div>


        </>

      )}
   {record && (
  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col lg:flex-row gap-6">
    {/* Pie Chart */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-4">Transaction Status Distribution</h3>
      {chartSeries.some(val => val > 0) ? (
        <Chart
          options={pieOptions}
          series={chartSeries}
          type="pie"
          height={350}
        />
      ) : (
        <div className="text-center text-gray-500">
          No transaction data available yet
        </div>
      )}
    </div>

    {/* Line Chart */}
    <div className="flex-1">
      <h3 className="text-lg font-semibold mb-4">Transactions Over Time</h3>
     {/* <MyBarChart record={record} type="payin" />
    <MyBarChart record={record} type="payout" /> */}
    <MyBarChart record={record} type={filter} />


    </div>
  </div>
)}

    </div>

  )
}

export default MerchantDetails