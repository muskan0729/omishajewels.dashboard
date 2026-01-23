import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart } from "../components/LineChart";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import { MONTH_NAMES } from "../constants/Constants";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { FlipCard } from "../components/FlipCard";
import StatsCards from "../components/StatsCards";

export const Dashboard = () => {
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeLeaderboardTab] = useState("Today");

  // ================= API CALLS =================
  const { data: cardData, loading: recordLoading } =
    useAutoFetch("/collection-record");

  const { data: tableData } = useAutoFetch(
    "/reportrecords-List?status=success",
  );

  // ✅ PAGINATION SAFE
  const initialDataOfTransactions = tableData?.data?.data ?? [];

  // ================= SORT DATA =================
  const sortedTransactions = useMemo(() => {
    if (!Array.isArray(initialDataOfTransactions)) return [];
    return [...initialDataOfTransactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [initialDataOfTransactions]);

  // ================= TOP 4 TRANSACTIONS =================
  const largeTransactionData = useMemo(() => {
    if (!Array.isArray(initialDataOfTransactions)) return [];
    return [...initialDataOfTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        name: item.user?.name ?? "-",
        amount: item.amount,
      }));
  }, [initialDataOfTransactions]);

  // ================= TABLE DATA =================
  const transactionData = useMemo(() => {
    return sortedTransactions.map((item, index) => {
      const date = new Date(item.created_at);
      const formattedDate = `${date.getDate()} ${
        MONTH_NAMES[date.getMonth()]
      } ${date.getFullYear()}`;
      const formattedTime = date.toLocaleTimeString();

      return {
        sqno: index + 1,
        txnid: item.txnid,
        name: item.user?.name ?? "-",
        type: item.product,
        amount: item.amount,
        status: (
          <span className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
            {item.status?.toUpperCase()}
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
  }, [sortedTransactions]);

  // ================= TABLE COLUMNS =================
  const transactioncolumn = [
    { header: "SQ No.", accessor: "sqno" },
    { header: "TXN Id", accessor: "txnid" },
    { header: "Name", accessor: "name" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "status" },
    { header: "Date/Time", accessor: "time" },
  ];

  // ================= INITIAL LOAD =================
  useEffect(() => {
    if (!recordLoading && cardData) {
      setInitialLoad(false);
    }
  }, [recordLoading, cardData]);

  // ================= KPI CARDS =================
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

  const totalCards = {
    title: "Total Collection",
    icon: "fa-arrow-trend-up",
    total:
      Number(cardData?.total_payout_amount ?? 0) +
      Number(cardData?.total_payin_amount ?? 0),
    today:
      Number(cardData?.today_payin ?? 0) + Number(cardData?.today_payout ?? 0),
    changePercent: 3.2,
  };

  const leaderboardByTab = {
    Today: largeTransactionData,
    monthly: largeTransactionData,
    allTime: largeTransactionData,
  };

  const currentLeaderboard = leaderboardByTab[activeLeaderboardTab] ?? [];

  // ================= RENDER =================
  return (
    <>
      {initialLoad ? (
        <DashboardSkeleton />
      ) : (
        <div className="flex min-h-screen bg-[#fefcf9]">
          <div className="flex-1 p-6 lg:p-10">
            {/* KPI */}
            <StatsCards
              inCard={inCard}
              outCard={outCard}
              totalCards={totalCards}
            />

            {/* Charts */}
            {role === "admin" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-12">
                <FlipCard
                  frontContent={
                    <DonutChart data={cardData?.transactionStatusCounts} />
                  }
                  backContent={
                    <div
                      className="rounded-xl p-4 space-y-3"
                      style={{
                        background: "linear-gradient(140deg, #F2DBBC, #FAF3E7)",
                      }}
                    >
                      {currentLeaderboard.length ? (
                        currentLeaderboard.map((item, index) => {
                          const medalColor =
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                                ? "text-gray-400"
                                : index === 2
                                  ? "text-amber-700"
                                  : "text-[#5c3d2e]";

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between gap-3
                       rounded-lg bg-white/80 px-4 py-3
                       shadow-sm hover:bg-white transition"
                            >
                              {/* Left: Medal + Name */}
                              <div className="flex items-start gap-3 flex-1">
                                <i
                                  className={`fa-solid fa-medal mt-0.5 ${medalColor}`}
                                  aria-hidden="true"
                                />

                                <span
                                  className="text-sm font-medium text-[#3f2a20]
                           break-words leading-snug"
                                >
                                  {item.name}
                                </span>
                              </div>

                              {/* Right: Amount */}
                              <span
                                className="text-sm font-semibold text-[#3f2a20]
                         whitespace-nowrap"
                              >
                                ₹{Number(item.amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div
                          className="rounded-lg bg-white/70 py-6
                   text-center text-sm font-medium text-[#5c3d2e]"
                        >
                          No Transactions
                        </div>
                      )}
                    </div>
                  }
                />

                <div className="xl:col-span-2 p-4 rounded-xl bg-white">
                  <h3 className="text-xl font-semibold mb-3">
                    Monthly Revenue
                  </h3>
                  <LineChart data={cardData?.monthWiseStatusCounts ?? []} />
                </div>
              </div>
            )}

            {/* Table */}
            <div className=" rounded-xl bg-white">
              <div className="px-6 py-4 border-b border-[#CA935C]">
                <h3 className="text-lg font-semibold text-[#3f2a20]">
                  Transactions Table
                </h3>
              </div>

              <div className="p-6">
                <Table
                  columns={transactioncolumn}
                  data={transactionData}
                  showSearch={true}
                  showPagination={true}
                  showExport={false}
                  showStatusFilter={true}
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
