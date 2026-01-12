import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart } from "../components/LineChart";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import { MONTH_NAMES } from "../constants/Constants";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { motion, AnimatePresence } from "framer-motion"; // ⭐ for smooth transitions
import { FlipCard } from "../components/FlipCard"; // adjust the path as needed
import StatsCards from "../components/StatsCards";

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
  console.log("wfwewewefwef ::", cardData);
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

  const currentLeaderboard = leaderboardByTab[activeLeaderboardTab] || [];

  const rankColors = ["#FFD700", "#567585", "#CD7F32"];
  return (
    <>
      {initialLoad ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex min-h-screen bg-[#fefcf9] transition-all duration-500">
          {/* ================= MAIN CONTENT ================= */}
          <div className="flex-1 p-6 lg:p-10">
            {/* =================== TOP 4 KPI CARDS =================== */}
            <StatsCards inCard={inCard} outCard={outCard} />

            {/* =================== CHART SECTION =================== */}
            {role === "admin" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 mb-12">
                <FlipCard
                  frontContent={
                    <div className="flex flex-col items-center justify-center flex-1">
                      <DonutChart data={cardData?.transactionStatusCounts} />
                    </div>
                  }
                  backContent={
                    <div className="flex flex-col flex-1 overflow-auto space-y-3">
                      {currentLeaderboard.length > 0 ? (
                        currentLeaderboard.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-4 rounded-xl border"
                            style={{
                              borderColor: "#f0ebe6",
                              background: "#fefcf9",
                            }}
                          >
                            {/* Rank Badge (No Background) */}
                            <div
                              className="w-12 h-12 flex items-center justify-center border-2 rounded-full"
                              style={{
                                borderColor:
                                  i === 0
                                    ? "#cd7f32"
                                    : i === 1
                                    ? "#e8b864"
                                    : i === 2
                                    ? "#edc98a"
                                    : "#f2dfbd",
                              }}
                            >
                              <span
                                className="text-xl font-semibold"
                                style={{
                                  color: i < 3 ? "#FFD700" : "#4d443b", // Gold for top 3, dark color for others
                                }}
                              >
                                {/* Font Awesome Icon for Rank */}
                                {i === 0 ? (
                                  <i
                                    className="fas fa-medal"
                                    style={{ color: "#cd7f32" }}
                                  ></i>
                                ) : i === 1 ? (
                                  <i
                                    className="fas fa-medal"
                                    style={{ color: "#e8b864" }}
                                  ></i>
                                ) : i === 2 ? (
                                  <i
                                    className="fas fa-medal"
                                    style={{ color: "#edc98a" }}
                                  ></i>
                                ) : (
                                  <i
                                    className="fas fa-trophy"
                                    style={{ color: "#f2dfbd" }}
                                  ></i>
                                )}
                              </span>
                            </div>

                            {/* Name and Amount */}
                            <div className="flex flex-col flex-1">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "#4d443b" }}
                              >
                                {item.name}
                              </p>
                              <p
                                className="font-semibold text-sm"
                                style={{ color: "#7a7167" }}
                              >
                                ₹{item.amount}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p
                          className="text-center text-sm py-4"
                          style={{ color: "#7a7167" }}
                        >
                          No Transactions
                        </p>
                      )}
                    </div>
                  }
                  width="w-full xl:col-span-1"
                  // you can tweak this height to fit your layout perfectly
                />

                {/* Monthly Line Chart */}
                <div
                  className="xl:col-span-2 p-3 rounded-2xl border shadow-sm"
                  style={{ background: "#fff", borderColor: "#e6ded4" }}
                >
                  <h3
                    className="text-xl font-semibold"
                    style={{ color: "#4d443b" }}
                  >
                    Monthly Revenue
                  </h3>
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
                  />
                </div>
              </div>
            )}

            {/* =================== NEW PREMIUM TABLE DESIGN =================== */}
            <div
              className="xl:col-span-2 p-0 rounded-2xl border shadow-sm overflow-hidden"
              style={{ background: "#fff", borderColor: "#e6ded4" }}
            >
              {/* Table Header */}
              <div
                className="px-6 py-4 rounded-t-2xl"
                style={{ background: "#f7f3ee", color: "#4d443b" }}
              >
                <h3 className="text-lg font-semibold">Transactions Table</h3>
              </div>

              {/* Table */}
              <div className="p-6">
                <Table
                  columns={transactioncolumn}
                  data={transactionData}
                  headerClassName="text-[#4d443b] bg-[#fefcf9] font-semibold text-sm uppercase border-b border-[#e6ded4]"
                  rowClassName="hover:bg-[#f7f3ee] even:bg-[#fcf8f1] border-b border-[#f0ebe6] transition-all"
                  tableClassName="rounded-xl overflow-hidden shadow-sm"
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
        </div>
      )}
    </>
  );
};
