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

  // ================= KPI / CHART =================
  const { data: cardData, loading: recordLoading } =
    useAutoFetch("/collection-record");

  // ================= CURSOR STATES =================
  const [rawData, setRawData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState(null);

  // ================= FETCH (NO STATUS IN URL) =================
  const fetchTransactions = async () => {
    if (!hasMore || tableLoading) return;

    setTableLoading(true);
    setTableError(null);

    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        per_page: 2000,
        ...(cursor && { cursor }),
      }).toString();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reportrecords-list?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const json = await res.json();

      if (json?.status) {
        setRawData((prev) => [...prev, ...(json.data || [])]);
        setCursor(json.next_cursor);

        if (!json.next_cursor) {
          setHasMore(false);
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(err);
      setTableError("Failed to load transactions");
    } finally {
      setTableLoading(false);
    }
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchTransactions();
  }, []);

  // ================= AUTO CURSOR =================
  useEffect(() => {
    if (cursor) fetchTransactions();
  }, [cursor]);

  // ================= SORT =================
  const sortedTransactions = useMemo(() => {
    return [...rawData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [rawData]);

  // ================= FRONTEND STATUS FILTER =================
  const filteredTransactions = useMemo(() => {
    if (statusFilter === "all") return sortedTransactions;

    return sortedTransactions.filter(
      (item) => item.status?.toLowerCase() === statusFilter.toLowerCase(),
    );
  }, [sortedTransactions, statusFilter]);

  // ================= TOP TRANSACTIONS =================
  const largeTransactionData = useMemo(() => {
    return [...rawData]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        name: item.user?.name ?? "-",
        amount: item.amount,
      }));
  }, [rawData]);

  // ================= TABLE DATA =================
  const transactionData = useMemo(() => {
    return filteredTransactions.map((item, index) => {
      const date = new Date(item.created_at);

      return {
        id: item.id, // ✅ VERY IMPORTANT
        sqno: index + 1,
        txnid: item.id,
        // name: item.user?.name ?? "-",
        merchant_details: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,

        type: item.product,
        amount: `₹${Number(item.amount).toLocaleString("en-IN")}`,
        status: (
          <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#F3E6C9] text-[#7A5A2B]">
            {item.status?.toUpperCase()}
          </span>
        ),
        // time: (
        //   <div className="flex flex-col">
        //     <span className="text-sm font-medium text-[#3F2A20]">
        //       {`${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`}
        //     </span>
        //     <span className="text-xs text-[#7A5A2B]">
        //       {date.toLocaleTimeString()}
        //     </span>
        //   </div>
        // ),
        time: (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[#3F2A20]">
              {`${String(date.getDate()).padStart(2, "0")} ${
                MONTH_NAMES[date.getMonth()]
              } ${String(date.getFullYear()).slice(-2)}`}
            </span>

            <span className="text-xs text-[#7A5A2B]">
              {date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        ),
      };
    });
  }, [filteredTransactions]);

  // ================= COLUMNS =================
  const transactioncolumn = [
    { header: "SQ No.", accessor: "id" },
    // { header: "TXN Id", accessor: "txnid" },
    { header: "Merchant", accessor: "merchant_details" },
    { header: "Type", accessor: "type" },
    { header: "Amount", accessor: "amount" },
    { header: "Date / Time", accessor: "time" },
    { header: "Status", accessor: "status" },
  ];

  // ================= INITIAL SKELETON =================
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

  const profitCard = {
    title: "Pay-OUT Collection",
    icon: "fa-wallet",
    total: cardData?.total_profit ?? 0,
    today: cardData?.total_profit ?? 0,
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
      Number(cardData?.today_payin ?? 0) + Number(cardData?.today_payout ?? 0),
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
            <StatsCards
              inCard={inCard}
              outCard={outCard}
              totalCards={totalCards}
            />

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
                              className="flex justify-between bg-white rounded-lg px-4 py-3 shadow-md"
                            >
                              <span>{item.name}</span>
                              <span className="font-semibold">
                                ₹{Number(item.amount).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">No Transactions</div>
                        )}
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {/* TABLE */}
            <div className="rounded-xl bg-white shadow-sm">
              <div className="px-6 py-4 border-b flex justify-between">
                <h3 className="text-lg font-semibold">Transactions Table</h3>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="
                      appearance-none
                      pl-4 pr-10 py-2
                      rounded-lg
                      bg-[#FEFCF9]
                      border border-[#E7D8B1]
                      text-[#3F2A20]
                      font-medium
                      shadow-sm
                      focus:outline-none
                      focus:ring-2 focus:ring-[#C9A24D]/40
                      focus:border-[#C9A24D]
                      hover:border-[#C9A24D]
                      transition-all duration-200
                      cursor-pointer
                    "
                  >
                    <option value="all">All Status</option>
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Icon */}
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5A2B]">
                    ▼
                  </span>
                </div>
              </div>

              <div className="p-6">
                {tableError ? (
                  <div className="text-center text-red-500">{tableError}</div>
                ) : (
                  <Table
                    columns={transactioncolumn}
                    data={transactionData}
                    rawData={rawData} // ✅ REQUIRED FOR SEARCH
                    loading={tableLoading}
                    showSearch
                    showPagination
                    showExport={false}
                    showStatusFilter={false}
                    showDeleteColumn={false}
                    showDateFilter={false}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
