import { useState, useEffect } from "react";
import Table from "../components/Table";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const UpiStatement = () => {
  const [upiData, setUpiData] = useState([]);

  // ─────────────────────────────────────
  // Cursor pagination states
  // ─────────────────────────────────────
  const [rawData, setRawData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────
  // Cursor-based API fetch
  // ─────────────────────────────────────
  const fetchUpiReports = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        product: "UPI",
        per_page: 5000,
        ...(cursor && { cursor }),
      }).toString();

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reportrecords-list?${query}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json?.status) {
        setRawData((prev) => [...prev, ...(json.data || [])]);
        setCursor(json.next_cursor);

        if (!json.next_cursor) {
          setHasMore(false); // ✅ finished
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load UPI statements");
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    fetchUpiReports();
  }, []);

  // Auto-load next chunks
  useEffect(() => {
    if (cursor) fetchUpiReports();
  }, [cursor]);

  // ─────────────────────────────────────
  // Data formatting (unchanged logic)
  // ─────────────────────────────────────
  useEffect(() => {
    if (!rawData.length) return;

    const statusClasses = {
      pending: "bg-[#dfaf03ff] text-white",
      initiated: "bg-[#0f3cb9ff] text-white",
      success: "bg-[#057034ff] text-white",
      complete: "bg-[#057034ff] text-white",
      failed: "bg-[#ff3366] text-white",
      reversed: "bg-[#ff3366] text-white",
      refunded: "bg-gray-400 text-white",
    };

    const sortedData = [...rawData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const formattedData = sortedData.map((item) => {
      const d = new Date(item.created_at);

      return {
        id: item.id,
        user_id: item.user_id,
        merchant_details: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,
        status: item.status,
        created_at: item.created_at,

        sqno: (
          <div className="flex flex-col text-left">
            <span><b>{item.id}</b></span>
            <span>
              {d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}
            </span>
            <span className="text-sm text-gray-500">
              {d.toLocaleTimeString()}
            </span>
          </div>
        ),

        txnid: (
          <div className="flex flex-col text-left">
            <span>Payee VPA: <b>{item.payee_vpa ?? "null"}</b></span>
            <span>Ref No: <b>{item.refno ?? "null"}</b></span>
            <span>Payee Txnid: <b>{item.mytxnid}</b></span>
            <span>TxnId: <b>{item.txnid}</b></span>
          </div>
        ),

        amount: (
          <div className="flex flex-col text-left">
            <span>Amount: <b>{item.amount}</b></span>
            <span>Charges: <b>{item.charge}</b></span>
            <span>GST: <b>{item.gst}</b></span>
            <span>
              Payin Rolling Amount: <b>{item.payin_rolling_amount}</b>
            </span>
          </div>
        ),

        numericAmount: parseFloat(item.amount) || 0,

        showstatus: (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              statusClasses[item.status] ?? "bg-gray-600 text-white"
            }`}
          >
            {item?.status
              ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
              : "N/A"}
          </span>
        ),
      };
    });

    setUpiData(formattedData);
  }, [rawData]);

  // ─────────────────────────────────────
  // Table columns
  // ─────────────────────────────────────
  const upiColumn = [
    { header: "Order Id", accessor: "sqno" },
    { header: "Merchant Details", accessor: "merchant_details" },
    { header: "Transaction Details", accessor: "txnid" },
    { header: "Amount / Commission", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#b58351] to-[#b6916d] rounded-lg p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">UPI Statement</h4>
      </div>

      {/* Table */}
      {loading && rawData.length === 0 ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">{error}</div>
      ) : (
        <Table
          columns={upiColumn}
          data={upiData}
          rawData={rawData}   // ✅ ADD THIS LINE
          showStatusFilter={true}
          showExport={true}
          showSearch={false}
          showDeleteColumn={false}
          showSelectUserFilter={true}
          statusList={REPORT_STATUSES}
        />
      )}

      {/* Loading indicator for next chunks */}
      {loading && rawData.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4 hidden">
          Loading more UPI records…
        </div>
      )}
    </div>
  );
};

export default UpiStatement;
