import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart } from "../components/LineChart";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import { MONTH_NAMES } from "../constants/Constants";
import DashboardSkeleton from "../components/DashboardSkeleton";
// import largesttxn from "../images/largesttxn.jpg";

export const Dashboard = () => {
  // Get role from localStorage
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");

  const [transactionData, setTransactionData] = useState([]);
  const [largeTransactionData, setLargeTransactionData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch data
  const { data: cardData, loading: recordLoading } = useAutoFetch("/collection-record");
  const { data: tableData } = useAutoFetch("/reportrecords-List?status=success");
  const { data: cryptotableData } = useAutoFetch("/crypto-reportrecords-list?status=success");

  const initialDataOfTransactions = tableData?.data;
  const cryptoinitialDataOfTransactions = cryptotableData?.data;

  // console.log("Table Data:", tableData);
  // console.log("Crypto Table Data:", cryptotableData);

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
    const tableSource =
      role === "crypto" ? cryptoprocessTableData : processTableData;

    const largeSource =
      role === "crypto" ? cryptoprocessLargeTransactionData : processLargeTransactionData;

    // Format table data
    const formattedTableData = tableSource.map((item, index) => {
      const date = new Date(item.created_at);
      const formattedDate = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
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

    // Format large transactions
    const formattedLargeTransactionData = largeSource.map((item) => ({
      name: item.user.name,
      amount: item.amount,
    }));

    setLargeTransactionData(formattedLargeTransactionData);
  }, [
    role,
    processTableData,
    processLargeTransactionData,
    cryptoprocessTableData,
    cryptoprocessLargeTransactionData,
  ]);

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

  // Role-based cards
  const normalCards = [
    { title: "Total Pay-IN Collection", icon: "fa-wallet", value: cardData?.total_payin_amount ?? 0 },
    { title: "Total Pay-OUT", icon: "fa-wallet", value: cardData?.total_payout_amount ?? 0 },
    { title: "Today Pay-IN Collection", icon: "fa-arrow-trend-up", value: cardData?.today_payin ?? 0 },
    { title: "Today Pay-OUT", icon: "fa-arrow-trend-up", value: cardData?.today_payout ?? 0 },
  ];

  const cryptoCard = [
    { title: "Total Crypto-IN Collection", icon: "fa-bitcoin-sign", value: cardData?.total_crypto ?? 0 },
    { title: "Total Crypto-OUT Collection", icon: "fa-bitcoin-sign", value: cardData?.total_crypto_payout ?? 0 },
    { title: "Today Crypto-IN Collection", icon: "fa-bitcoin-sign", value: cardData?.today_crypto ?? 0 },
    { title: "Today Crypto-OUT Collection", icon: "fa-bitcoin-sign", value: cardData?.today_crypto_payout ?? 0 },
  ];

  let cardsToShow = [];
  if (role === "admin") cardsToShow = [...normalCards];
  else if (role === "crypto") cardsToShow = [...cryptoCard];
  else cardsToShow = [...normalCards]; // normal users
console.log(cardData?.transactionStatusCounts);
  return (
    <>
      {initialLoad ? (
        <DashboardSkeleton />
      ) : (
        <div className="w-full flex justify-center py-8">
          <div className="w-full max-w-[1140px] px-4 lg:px-6">
            
            {/* -------- TOP CARDS + DONUT/LINE CHART -------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

              {/* Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {cardsToShow.map((card, i) => (
                  <div key={i} className="relative bg-white rounded-xl shadow-[0_4px_15px_rgba(255,165,0,0.2)] flex flex-col h-full transform transition-transform duration-500 hover:scale-105 hover:shadow-[0_6px_20px_rgba(255,165,0,0.3)]">
                    <div className="flex items-center px-5 py-4 bg-[#b58351] text-white relative z-10 gap-4 rounded-t-xl">
                      <div className="bg-white rounded-full p-3 flex items-center justify-center shrink-0">
                        <i className={`fa-solid ${card.icon} text-[#b58351] text-xl`}></i>
                      </div>
                      <h5 className="text-base sm:text-lg font-semibold text-white truncate whitespace-nowrap">
                        {card.title}
                      </h5>
                    </div>
                    <svg className="absolute bottom-0 w-full" viewBox="0 0 500 40" preserveAspectRatio="none">
                      <path d="M0,0 C250,40 250,40 500,0 L500,40 L0,40 Z" className="fill-gray-300" />
                    </svg>
                    <div className="flex justify-between items-center px-5 py-6 relative z-10 flex-1">
                      <h6 className="text-2xl font-bold text-gray-800 leading-none">₹ {card.value}</h6>
                      <div className="bg-green-100 outline outline-green-500 text-xs rounded-full px-3 py-1 text-green-600 flex items-center">
                        <i className="fa-solid fa-arrow-up fa-xs mr-1"></i> 3.2%
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
            {(role === "admin" || role === "user") && (
  <>
    <div className="flex justify-center items-start">
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
                { month: "Apr", count: 0 }
              ]
        }
        className="h-[260px]"
      />
    </div>
  </>
)}


              {role === "crypto" && (
                <>
                  <div className="flex justify-center items-start">
                    <div className="w-full max-w-[380px] p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(255,192,203,0.25)]">
                      <DonutChart data={cardData?.cryptoTransactionStatusCounts} />
                    </div>
                  </div>
                  <div className="lg:col-span-2 p-6 rounded-xl backdrop-blur-xl shadow-[0_4px_20px_rgba(144,238,144,0.25)]">
                    <LineChart data={cardData?.cryptoMonthWiseStatusCounts} className="h-[260px]" />
                  </div>
                </>
              )}

              {/* Large Transactions */}
             
            <div className="flex justify-center">
  <div className="w-full max-w-[380px] p-6 rounded-xl bg-white/30 backdrop-blur-xl shadow-[0_4px_25px_rgba(255,182,193,0.25)]">
    <h5 className="text-lg font-bold mb-4">
      {role === "crypto" ? "Crypto Large Transactions" : "Large Transactions"}
    </h5>

    <ul className="divide-y divide-white/10">
      {largeTransactionData.length > 0 ? (
        largeTransactionData.map((item, index) => (
          <li
            key={index}
            className="py-3 sm:py-4 rounded-lg bg-[rgba(255,255,255,0.1)]"
          >
            <div className="flex justify-between">
              <p className="text-sm font-medium text-black truncate">{item.name}</p>
              <div className="text-base font-semibold text-black">₹{item.amount}</div>
            </div>
          </li>
        ))
      ) : (
        <li className="py-3 sm:py-4 rounded-lg bg-[rgba(255,255,255,0.1)]">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-black truncate">No Transactions</p>
            <div className="text-base font-semibold text-black">₹0</div>
          </div>
        </li>
      )}
    </ul>
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
