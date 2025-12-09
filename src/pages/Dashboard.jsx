// import { useEffect, useMemo, useState } from "react";
// import { DonutChart } from "../components/DonutChart";
// import { LineChart } from "../components/LineChart";
// import Table from "../components/Table";
// import useAutoFetch from "../hooks/useAutoFetch";
// import { MONTH_NAMES } from "../constants/Constants";
// import DashboardSkeleton from "../components/DashboardSkeleton";
// // import largesttxn from "../images/largesttxn.jpg";

// export const Dashboard = () => {
//   // Get role from localStorage
//   const [role] = useState(atob(localStorage.getItem("role")) || "admin");

//   const [transactionData, setTransactionData] = useState([]);
//   const [largeTransactionData, setLargeTransactionData] = useState([]);
//   const [initialLoad, setInitialLoad] = useState(true);

//   // Fetch data
//   const { data: cardData, loading: recordLoading } =
//     useAutoFetch("/collection-record");
//   const { data: tableData } = useAutoFetch(
//     "/reportrecords-List?status=success"
//   );
//   const { data: cryptotableData } = useAutoFetch(
//     "/crypto-reportrecords-list?status=success"
//   );

//   const initialDataOfTransactions = tableData?.data;
//   const cryptoinitialDataOfTransactions = cryptotableData?.data;

//   // console.log("Table Data:", tableData);
//   // console.log("Crypto Table Data:", cryptotableData);

//   // Process table data
//   const processTableData = useMemo(() => {
//     if (!initialDataOfTransactions) return [];
//     return [...initialDataOfTransactions].sort(
//       (a, b) => new Date(b.created_at) - new Date(a.created_at)
//     );
//   }, [initialDataOfTransactions]);

//   const cryptoprocessTableData = useMemo(() => {
//     if (!cryptoinitialDataOfTransactions) return [];
//     return [...cryptoinitialDataOfTransactions].sort(
//       (a, b) => new Date(b.created_at) - new Date(a.created_at)
//     );
//   }, [cryptoinitialDataOfTransactions]);

//   // Process top 4 largest transactions
//   const processLargeTransactionData = useMemo(() => {
//     if (!initialDataOfTransactions) return [];
//     return [...initialDataOfTransactions]
//       .sort((a, b) => b.amount - a.amount)
//       .slice(0, 4);
//   }, [initialDataOfTransactions]);

//   const cryptoprocessLargeTransactionData = useMemo(() => {
//     if (!cryptoinitialDataOfTransactions) return [];
//     return [...cryptoinitialDataOfTransactions]
//       .sort((a, b) => b.amount - a.amount)
//       .slice(0, 4);
//   }, [cryptoinitialDataOfTransactions]);

//   // Format transaction & large transaction data
//   useEffect(() => {
//     const tableSource = processTableData;

//     const largeSource = processLargeTransactionData;

//     // Format table data
//     const formattedTableData = tableSource.map((item, index) => {
//       const date = new Date(item.created_at);
//       const formattedDate = `${date.getDate()} ${
//         MONTH_NAMES[date.getMonth()]
//       } ${date.getFullYear()}`;
//       const formattedTime = date.toLocaleTimeString();

//       return {
//         sqno: index + 1,
//         txnid: item.txnid,
//         name: item.user.name,
//         type: item.product,
//         amount: item.amount,
//         status: (
//           <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
//             {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
//           </span>
//         ),
//         time: (
//           <div className="flex flex-col">
//             <span className="text-sm font-medium">{formattedDate}</span>
//             <span className="text-sm text-gray-500">{formattedTime}</span>
//           </div>
//         ),
//       };
//     });
//     setTransactionData(formattedTableData);

//     // Format large transactions
//     const formattedLargeTransactionData = largeSource.map((item) => ({
//       name: item.user.name,
//       amount: item.amount,
//     }));

//     setLargeTransactionData(formattedLargeTransactionData);
//   }, [
//     role,
//     processTableData,
//     processLargeTransactionData,

//   ]);

//   // Table columns
//   const transactioncolumn = [
//     { header: "SQ No.", accessor: "sqno" },
//     { header: "TXN Id", accessor: "txnid" },
//     { header: "Name", accessor: "name" },
//     { header: "Type", accessor: "type" },
//     { header: "Amount", accessor: "amount" },
//     { header: "Status", accessor: "status" },
//     { header: "Date/Time", accessor: "time" },
//   ];

//   useEffect(() => {
//     if (!recordLoading && cardData) setInitialLoad(false);
//     console.log(cardData);
//   }, [recordLoading, cardData]);

//   // ---- Build Combined Cards ----
//   const inCard = {
//     title: "Pay-IN Collection",
//     icon: "fa-arrow-trend-up",
//     total: cardData?.total_payin_amount ?? 0,
//     today: cardData?.today_payin ?? 0,
//     // TODO: replace with actual % logic if needed
//     changePercent: 3.2,
//   };

//   const outCard = {
//     title: "Pay-OUT Collection",
//     icon: "fa-wallet",
//     total: cardData?.total_payout_amount ?? 0,
//     today: cardData?.today_payout ?? 0,
//     // TODO: replace with actual % logic if needed
//     changePercent: 3.2,
//   };

//   console.log(cardData?.transactionStatusCounts); 

//   return (
//     <>
//       {initialLoad ? (
//         <DashboardSkeleton />
//       ) : (
//         <div className="w-full flex justify-center py-8">
//           <div className="w-full max-w-[1140px] px-4 lg:px-6">
            
//             {/* -------- TOP CARDS + DONUT/LINE CHART -------- */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//               {/* ---- TWO MAIN CARDS ---- */}
//               <div className="lg:col-span-2 grid grid-cols-1 gap-6 items-start w-full mt-6">
//                 {/* -------- IN CARD -------- */}
//                 <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg border border-orange-200 transition w-full">

//                   {/* Header */}
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="bg-[#b58351] text-white p-2.5 rounded-full">
//                         <i className={`fa-solid ${inCard.icon} text-lg`}></i>
//                       </div>
//                       <h3 className="text-base sm:text-lg font-semibold">{inCard.title}</h3>
//                     </div>

//                     <div className="bg-green-100 outline outline-1 outline-green-500 text-[11px] sm:text-xs rounded-full px-2.5 py-1 text-green-600 flex items-center">
//                       <i className="fa-solid fa-arrow-up fa-xs mr-1"></i>
//                       {inCard.changePercent}%
//                     </div>
//                   </div>

//                   {/* 3 Sections */}
//                   <div className="grid grid-cols-3 gap-4 text-center">

//                     {/* Total */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Total</p>
//                       <p className="text-xl sm:text-2xl font-bold text-gray-900">₹ {inCard.total}</p>
//                     </div>

//                     {/* Today */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Today</p>
//                       <p className="text-xl sm:text-2xl font-bold text-gray-900">₹ {inCard.today}</p>
//                     </div>

//                     {/* Profit */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Profit</p>
//                       <p className="text-xl sm:text-2xl font-bold text-green-600">
//                         ₹ {inCard.total - inCard.today}
//                       </p>
//                     </div>

//                   </div>
//                 </div>


//                 {/* -------- OUT CARD -------- */}
//                 <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg border border-orange-200 transition w-full">

//                   {/* Header */}
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-3">
//                       <div className="bg-[#b58351] text-white p-2.5 rounded-full">
//                         <i className={`fa-solid ${outCard.icon} text-lg`}></i>
//                       </div>
//                       <h3 className="text-base sm:text-lg font-semibold">{outCard.title}</h3>
//                     </div>

//                     <div className="bg-green-100 outline outline-1 outline-green-500 text-[11px] sm:text-xs rounded-full px-2.5 py-1 text-green-600 flex items-center">
//                       <i className="fa-solid fa-arrow-up fa-xs mr-1"></i>
//                       {outCard.changePercent}%
//                     </div>
//                   </div>

//                   {/* 3 Sections */}
//                   <div className="grid grid-cols-3 gap-4 text-center">

//                     {/* Total */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Total</p>
//                       <p className="text-xl sm:text-2xl font-bold text-gray-900">₹ {outCard.total}</p>
//                     </div>

//                     {/* Today */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Today</p>
//                       <p className="text-xl sm:text-2xl font-bold text-gray-900">₹ {outCard.today}</p>
//                     </div>

//                     {/* Profit */}
//                     <div>
//                       <p className="text-gray-600 text-sm font-medium text-[18px]">Profit</p>
//                       <p className="text-xl sm:text-2xl font-bold text-green-600">
//                         ₹ {outCard.total - outCard.today}
//                       </p>
//                     </div>

//                   </div>
//                 </div>

//               </div>
        
//               {/* Charts */}
//               {(role === "admin" || role === "user") && (
//                 <>
//                   <div className="flex justify-center items-start">
//                     <div className="w-full max-w-[380px] p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(255,192,203,0.25)]">
//                       <DonutChart data={cardData?.transactionStatusCounts} />
//                     </div>
//                   </div>

//                   <div className="lg:col-span-2 p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(144,238,144,0.25)]">
//                     <LineChart
//                       data={
//                         cardData?.monthWiseStatusCounts?.length > 0
//                           ? cardData.monthWiseStatusCounts
//                           : [
//                               { month: "Jan", count: 0 },
//                               { month: "Feb", count: 0 },
//                               { month: "Mar", count: 0 },
//                               { month: "Apr", count: 0 },
//                             ]
//                       }
//                       className="h-[260px]"
//                     />
//                   </div>
//                 </>
//               )}

//               {/* Large Transactions */}

//               <div className="flex justify-center">
//                 <div className="w-full max-w-[380px] p-6 rounded-xl bg-white/30 backdrop-blur-xl shadow-[0_4px_25px_rgba(255,182,193,0.25)]">
//                   <h5 className="text-lg font-bold mb-4">
//                     Top Transactions
//                   </h5>


//                   <ul className="divide-y divide-white/10">
//                     {largeTransactionData.length > 0 ? (
//                       largeTransactionData.map((item, index) => (
//                         <li
//                           key={index}
//                           className="py-3 sm:py-4 rounded-lg bg-[rgba(255,255,255,0.1)]"
//                         >
//                           <div className="flex justify-between">
//                             <p className="text-sm font-medium text-black truncate">
//                               {item.name}
//                             </p>
//                             <div className="text-base font-semibold text-black">
//                               ₹{item.amount}
//                             </div>
//                           </div>
//                         </li>
//                       ))
//                     ) : (
//                       <li className="py-3 sm:py-4 rounded-lg bg-[rgba(255,255,255,0.1)]">
//                         <div className="flex justify-between">
//                           <p className="text-sm font-medium text-black truncate">
//                             No Transactions
//                           </p>
//                           <div className="text-base font-semibold text-black">
//                             ₹0
//                           </div>
//                         </div>
//                       </li>
//                     )}
//                   </ul>
//                 </div>
//               </div>
//             </div>

//             {/* -------- TABLE -------- */}
//             <div className="mt-8 mb-4">
//               <Table
//                 columns={transactioncolumn}
//                 data={transactionData}
//                 showSearch={false}
//                 showPagination={true}
//                 showExport={false}
//                 showStatusFilter={false}
//                 showDeleteColumn={false}
//                 showDateFilter={false}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart } from "../components/LineChart";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import { MONTH_NAMES } from "../constants/Constants";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { motion, AnimatePresence } from "framer-motion"; // ⭐ for smooth transitions

// import largesttxn from "../images/largesttxn.jpg";

export const Dashboard = () => {
  // Get role from localStorage
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");

  const [transactionData, setTransactionData] = useState([]);
  const [largeTransactionData, setLargeTransactionData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Leaderboard tab state
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState("Today");

  // Fetch data
  const { data: cardData, loading: recordLoading } =
    useAutoFetch("/collection-record");
  const { data: tableData } = useAutoFetch(
    "/reportrecords-List?status=success"
  );
  const { data: cryptotableData } = useAutoFetch(
    "/crypto-reportrecords-list?status=success"
  );

  const initialDataOfTransactions = tableData?.data;
  const cryptoinitialDataOfTransactions = cryptotableData?.data;

  // Process table data
  const processTableData = useMemo(() => {
    if (!initialDataOfTransactions) return [];
    return [...initialDataOfTransactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [initialDataOfTransactions]);

  const cryptoprocessTableData = useMemo(() => {
    if (!cryptoinitialDataOfTransactions) return [];
    return [...cryptoinitialDataOfTransactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [cryptoinitialDataOfTransactions]);

  // Process top 4 largest transactions
  const processLargeTransactionData = useMemo(() => {
    if (!initialDataOfTransactions) return [];
    return [...initialDataOfTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [initialDataOfTransactions]);

  const cryptoprocessLargeTransactionData = useMemo(() => {
    if (!cryptoinitialDataOfTransactions) return [];
    return [...cryptoinitialDataOfTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);
  }, [cryptoinitialDataOfTransactions]);

  // Format transaction & large transaction data
  useEffect(() => {
    const tableSource = processTableData;
    const largeSource = processLargeTransactionData;

    // Format table data
    const formattedTableData = tableSource.map((item, index) => {
      const date = new Date(item.created_at);
      const formattedDate = `${date.getDate()} ${
        MONTH_NAMES[date.getMonth()]
      } ${date.getFullYear()}`;
      const formattedTime = date.toLocaleTimeString();

      return {
        sqno: index + 1,
        txnid: item.txnid,
        name: item.user.name,
        type: item.product,
        amount: item.amount,
        status: (
          <span className="px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
        ),
        time: (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formattedDate}</span>
            <span className="text-sm text-gray-500">{formattedTime}</span>
          </div>
        ),
      };
    });
    setTransactionData(formattedTableData);

    // Format large transactions for leaderboard
    const formattedLargeTransactionData = largeSource.map((item) => ({
      name: item.user.name,
      amount: item.amount,
      image: item.user?.avatar || null, // optional, if you ever have image
    }));

    setLargeTransactionData(formattedLargeTransactionData);
  }, [role, processTableData, processLargeTransactionData]);

  // Table columns
  const transactioncolumn = [
    { header: "SQ No.", accessor: "sqno" },
    { header: "TXN Id", accessor: "txnid" },
    { header: "Name", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "status" },
    { header: "Date/Time", accessor: "time" },
  ];

  useEffect(() => {
    if (!recordLoading && cardData) setInitialLoad(false);
    console.log(cardData);
  }, [recordLoading, cardData]);

  // ---- Build Combined Cards ----
  const inCard = {
    title: "Pay-IN Collection",
    icon: "fa-arrow-trend-up",
    total: cardData?.total_payin_amount ?? 0,
    today: cardData?.today_payin ?? 0,
    changePercent: 3.2,
  };

  const outCard = {
    title: "Pay-OUT Collection",
    icon: "fa-wallet",
    total: cardData?.total_payout_amount ?? 0,
    today: cardData?.today_payout ?? 0,
    changePercent: 3.2,
  };

  console.log(cardData?.transactionStatusCounts);

  // Leaderboard data per tab (for now all three use same data;
  // you can plug different arrays later if you have them)
  const leaderboardByTab = useMemo(
    () => ({
      Today: largeTransactionData,
      monthly: largeTransactionData,
      allTime: largeTransactionData,
    }),
    [largeTransactionData]
  );

  const currentLeaderboard =
    leaderboardByTab[activeLeaderboardTab] || [];

  const rankColors = ["#FFD700", "#567585", "#CD7F32"];

  return (
    <>
      {initialLoad ? (
        <DashboardSkeleton />
      ) : (
        <div className="w-full flex justify-center py-8">
          <div className="w-full max-w-[1140px] px-4 lg:px-6">
            {/* -------- TOP CARDS + DONUT/LINE CHART -------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* ---- TWO MAIN CARDS ---- */}
              <div className="lg:col-span-2 grid grid-cols-1 gap-6 items-start w-full mt-6">
                {/* -------- IN CARD -------- */}
                <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg border border-orange-200 transition w-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#b58351] text-white p-2.5 rounded-full">
                        <i className={`fa-solid ${inCard.icon} text-lg`}></i>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        {inCard.title}
                      </h3>
                    </div>

                    <div className="bg-green-100 outline outline-1 outline-green-500 text-[11px] sm:text-xs rounded-full px-2.5 py-1 text-green-600 flex items-center">
                      <i className="fa-solid fa-arrow-up fa-xs mr-1"></i>
                      {inCard.changePercent}%
                    </div>
                  </div>

                  {/* 3 Sections */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Total */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Total
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹ {inCard.total}
                      </p>
                    </div>

                    {/* Today */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Today
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹ {inCard.today}
                      </p>
                    </div>

                    {/* Profit */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Profit
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        ₹ {inCard.total - inCard.today}
                      </p>
                    </div>
                  </div>
                </div>

                {/* -------- OUT CARD -------- */}
                <div className="bg-white rounded-xl p-4 lg:p-5 shadow-md hover:shadow-lg border border-orange-200 transition w-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#b58351] text-white p-2.5 rounded-full">
                        <i className={`fa-solid ${outCard.icon} text-lg`}></i>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold">
                        {outCard.title}
                      </h3>
                    </div>

                    <div className="bg-green-100 outline outline-1 outline-green-500 text-[11px] sm:text-xs rounded-full px-2.5 py-1 text-green-600 flex items-center">
                      <i className="fa-solid fa-arrow-up fa-xs mr-1"></i>
                      {outCard.changePercent}%
                    </div>
                  </div>

                  {/* 3 Sections */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {/* Total */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Total
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹ {outCard.total}
                      </p>
                    </div>

                    {/* Today */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Today
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">
                        ₹ {outCard.today}
                      </p>
                    </div>

                    {/* Profit */}
                    <div>
                      <p className="text-gray-600 text-sm font-medium text-[18px]">
                        Profit
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">
                        ₹ {outCard.total - outCard.today}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {(role === "admin" || role === "user") && (
                <>
                  <div className="flex justify-center items-start ">
                    <div className="w-full max-w-[380px] p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(255,192,203,0.25)]">
                      <DonutChart data={cardData?.transactionStatusCounts} />
                    </div>
                  </div>

                  <div className="lg:col-span-2 p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(144,238,144,0.25)]">
                    <LineChart
                      data={
                        cardData?.monthWiseStatusCounts?.length > 0
                          ? cardData.monthWiseStatusCounts
                          : [
                              { month: "Jan", count: 0 },
                              { month: "Feb", count: 0 },
                              { month: "Mar", count: 0 },
                              { month: "Apr", count: 0 },
                            ]
                      }
                      className="h-[260px]"
                    />
                  </div>
                </>
              )}

              {/* -------- LEADERBOARD: TOP TRANSACTIONS -------- */}
              <div className="flex justify-center">
                <div className="border border-orange-200 w-full max-w-[380px] p-6 rounded-2xl bg-white/30 backdrop-blur-xl shadow-[0_4px_25px_rgba(255,182,193,0.25)]">
                  {/* Title */}
                  <h5 className="text-xl font-bold text-black text-center mb-4">
                    Top Transactions
                  </h5>

                  {/* Tabs */}
                  <div className="flex justify-around mb-4">
                    {["Today", "monthly", "allTime"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveLeaderboardTab(tab)}
                        className={`pb-1 text-sm font-medium transition-all duration-300 ${
                          activeLeaderboardTab === tab
                            ? "text-black border-b-2 border-lime-500"
                            : "text-gray-500"
                        }`}
                      >
                        {tab === "Today"
                          ? "Today"
                          : tab === "monthly"
                          ? "monthly"
                          : "All-Time"}
                      </button>
                    ))}
                  </div>

                  {/* Animated list */}
                  <AnimatePresence mode="wait">
                    <motion.ul
                      key={activeLeaderboardTab}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="divide-y divide-white/10"
                    >
                      {currentLeaderboard.length > 0 ? (
                        currentLeaderboard.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="py-3 flex items-center gap-4"
                          >
                            {/* Rank */}
                            <div
                              className="w-6 text-center font-semibold"
                              style={{
                                color:
                                  index < 3
                                    ? rankColors[index]
                                    : "#111",
                              }}
                            >
                              {index + 1}
                            </div>

                            {/* Avatar / Initial */}
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-black overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (item.name || "?")
                                  .charAt(0)
                                  .toUpperCase()
                              )}
                            </div>

                            {/* Name */}
                            <p className="flex-1 text-sm font-medium text-black truncate">
                              {item.name}
                            </p>

                            {/* Amount / Points */}
                            <div className="text-sm font-semibold text-black">
                              ₹{item.amount}
                            </div>
                          </motion.li>
                        ))
                      ) : (
                        <li className="py-4 text-center text-black/60">
                          No Transactions
                        </li>
                      )}
                    </motion.ul>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* -------- TABLE -------- */}
            <div className="mt-8 mb-4">
              <Table
                columns={transactioncolumn}
                data={transactionData}
                showSearch={false}
                showPagination={true}
                showExport={false}
                showStatusFilter={false}
                showDeleteColumn={false}
                showDateFilter={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
