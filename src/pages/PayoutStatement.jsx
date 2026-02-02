import { useState, useEffect } from "react";
import Table from "../components/Table";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const PayoutStatement = () => {
  const [payoutData, setPayoutData] = useState([]);

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
  const fetchPayoutReports = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const query = new URLSearchParams({
        product: "payout",
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
          setHasMore(false);
        }
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load payout statements");
    } finally {
      setLoading(false);
    }
  };

  // First load
  useEffect(() => {
    fetchPayoutReports();
  }, []);

  // Auto load next cursor pages
  useEffect(() => {
    if (cursor) fetchPayoutReports();
  }, [cursor]);

  // ─────────────────────────────────────
  // Data formatting
  // ─────────────────────────────────────
  useEffect(() => {
    if (!rawData.length) return;

    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      initiated: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      complete: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    const sortedData = [...rawData].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    const formatted = sortedData.map((item, index) => {
      const date = new Date(item.created_at);

      return {
        // 🔑 required for status filter
        status: item.status?.toLowerCase() ?? "pending",

        id: item.id,
        user_id: item.user_id,

        sqno: (
          <div className="text-left">
            <b>{item.id}</b>
            <div className="text-xs text-gray-600">
              {date.getDate()} {MONTH_NAMES[date.getMonth()]}{" "}
              {date.getFullYear()}
              <br />
              {date.toLocaleTimeString()}
            </div>
          </div>
        ),

        merchant_details: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,

        txnid: (
          <div className="text-left text-sm space-y-1">
            <div>Mode: <b>{item.payout_mode ?? "N/A"}</b></div>
            <div>Account: <b>{item.payer_acc_no ?? "N/A"}</b></div>
            <div>Holder: <b>{item.payer_name ?? "N/A"}</b></div>
            <div>IFSC: <b>{item.payer_ifsc ?? "N/A"}</b></div>
            <div>UPI: <b>{item.payer_upi ?? "N/A"}</b></div>
            <div>Mobile: <b>{item.payer_mobile ?? "N/A"}</b></div>
          </div>
        ),

        reference_details: (
          <div className="text-left text-sm space-y-1">
            <div>Ref No: <b>{item.refno ?? "N/A"}</b></div>
            <div>Order ID: <b>{item.mytxnid ?? "N/A"}</b></div>
            <div>Txn ID: <b>{item.txnid ?? "N/A"}</b></div>
          </div>
        ),

        amount: (
          <div className="text-left text-sm space-y-1">
            <div>Opening: <b>{item.payout_opening_balance ?? 0}</b></div>
            <div>Pay Amount: <b>{item.payout_amount ?? 0}</b></div>
            <div>Charges: <b>{item.payer_charges ?? 0}</b></div>
            <div>Total Debit: <b>{item.total_debit ?? 0}</b></div>
            <div>Closing: <b>{item.payout_closing_balance ?? 0}</b></div>
            <div>Note: <b>{item.note ?? "-"}</b></div>
          </div>
        ),

        showstatus: (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              statusClasses[item.status] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {item.status?.toUpperCase() ?? "N/A"}
          </span>
        ),
      };
    });

    setPayoutData(formatted);
  }, [rawData]);

  // ─────────────────────────────────────
  // Table columns
  // ─────────────────────────────────────
  const payoutColumns = [
    { header: "Order ID", accessor: "sqno" },
    { header: "User Details", accessor: "merchant_details" },
    { header: "Bank Details", accessor: "txnid" },
    { header: "Reference Details", accessor: "reference_details" },
    { header: "Amount / Commission", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#b58351] to-[#b6916d] rounded-lg p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Payout Statement</h4>
      </div>

      {/* TABLE */}
      {loading && rawData.length === 0 ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">{error}</div>
      ) : (
        <Table
          columns={payoutColumns}
          data={payoutData}
          rawData={rawData}   // ✅ THIS IS REQUIRED
          showStatusFilter
          statusList={REPORT_STATUSES}
          showExport
          showSearch={false}
          showSelectUserFilter
          showDeleteColumn={false}
        />
      )}
    </div>
  );
};

export default PayoutStatement;
