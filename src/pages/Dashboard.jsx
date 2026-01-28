import { useEffect, useMemo, useState } from "react";
import { DonutChart } from "../components/DonutChart";
import { LineChart } from "../components/LineChart";
import Table from "../components/Table";
import useAutoFetch from "../hooks/useAutoFetch";
import { MONTH_NAMES } from "../constants/Constants";
import DashboardSkeleton from "../components/DashboardSkeleton";
import { FlipCard } from "../components/FlipCard";
import StatsCards from "../components/StatsCards";

const STATUS_LIST = [
  "pending",
  "success",
  "failed",
  "reversed",
  "refunded",
  "complete",
  "initiated",
];
export const Dashboard = () => {
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");
  const [initialLoad, setInitialLoad] = useState(true);
 const [statusFilter, setStatusFilter] = useState("success");
  // ================= API CALLS =================
  const { data: cardData, loading: recordLoading } =
    useAutoFetch("/collection-record");

  // ⚠️ IMPORTANT: LIMIT DATA FOR PERFORMANCE
  const { data: tableData, loading: tableLoading } = useAutoFetch(
    `/reportrecords-list?status=${statusFilter}`
  );


  // ✅ FIX: correct response path
  const initialDataOfTransactions = useMemo(() => {
    return Array.isArray(tableData?.data) ? tableData.data : [];
  }, [tableData]);

  // ================= SORT =================
  const sortedTransactions = useMemo(() => {
    return [...initialDataOfTransactions].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [initialDataOfTransactions]);

  // ================= TOP TRANSACTIONS =================
  const largeTransactionData = useMemo(() => {
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

      return {
        sqno: index + 1,
        txnid: item.id,
        name: item.user?.name ?? "-",
        type: item.product,
        amount: `₹${Number(item.amount).toLocaleString("en-IN")}`,
        status: (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#F3E6C9] text-[#7A5A2B]">
            {item.status?.toUpperCase()}
          </span>
        ),
        time: (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#3F2A20]">
              {`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`}
            </span>
            <span className="text-xs text-[#7A5A2B]">
              {date.toLocaleTimeString()}
            </span>
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
    { header: "Date / Time", accessor: "time" },
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
    color: "#C9A24D",
  };

  const outCard = {
    title: "Pay-OUT Collection",
    icon: "fa-wallet",
    total: cardData?.total_payout_amount ?? 0,
    today: cardData?.today_payout ?? 0,
    changePercent: 3.2,
    color: "#B38A3C",
  };

  const totalCards = {
    title: "Total Collection",
    icon: "fa-layer-group",
    total:
      Number(cardData?.total_payout_amount ?? 0) +
      Number(cardData?.total_payin_amount ?? 0),
    today:
      Number(cardData?.today_payin ?? 0) +
      Number(cardData?.today_payout ?? 0),
    changePercent: 3.2,
    color: "#7A5A2B",
  };

  // ================= RENDER =================
  return (
    <>
      {initialLoad ? (
        <DashboardSkeleton />
      ) : (
        <div className="min-h-screen bg-[#FEFCF9]">
          <div className="p-6 lg:p-10 space-y-10">
            {/* KPI */}
            <StatsCards
              inCard={inCard}
              outCard={outCard}
              totalCards={totalCards}
            />

            {/* Charts */}
            {role === "admin" && (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 p-6 rounded-xl bg-white shadow-md">
                  <h3 className="text-xl font-semibold text-[#3F2A20] mb-4">
                    Monthly Revenue
                  </h3>
                  <LineChart data={cardData?.monthWiseStatusCounts ?? []} />
                </div>

                <div className="lg:w-1/3">
                  <FlipCard
                    frontContent={
                      <DonutChart data={cardData?.transactionStatusCounts} />
                    }
                    backContent={
                      <div className="rounded-xl p-4 space-y-3 bg-gradient-to-br from-[#F3E6C9] to-[#FEFCF9]">
                        {largeTransactionData.length ? (
                          largeTransactionData.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center bg-white rounded-lg px-4 py-3 shadow-md"
                            >
                              <span className="text-sm font-medium text-[#3F2A20]">
                                {item.name}
                              </span>
                              <span className="text-sm font-semibold text-[#7A5A2B]">
                                ₹{Number(item.amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-[#7A5A2B] font-medium">
                            No Transactions
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="rounded-xl bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-[#E2D2AA] flex items-center justify-between">
  <h3 className="text-lg font-semibold text-[#3F2A20]">
    Transactions Table
  </h3>

  <div className="flex items-center gap-2">
    <span className="text-sm font-medium text-[#7A5A2B]">
      Status:
    </span>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="px-3 py-2 rounded-lg border border-[#E2D2AA]"
    >
      <option value="all">All</option>
      {STATUS_LIST.map((s) => (
        <option key={s} value={s}>
          {s.toUpperCase()}
        </option>
      ))}
    </select>
  </div>
</div>


              <div className="p-6">
                <Table
                  columns={transactioncolumn}
                  data={transactionData}
                  loading={tableLoading}
                  showSearch
                  showPagination
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
