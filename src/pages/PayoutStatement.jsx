import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const PayoutStatement = () => {
  const [payoutData, setPayoutData] = useState([]);

  const { data, loading, error } = useGet("/reportrecords-list?product=payout");

  useEffect(() => {
    if (!data) return;

    // ✅ HANDLE BOTH API RESPONSE SHAPES
    const records =
      Array.isArray(data?.data?.data)
        ? data.data.data
        : Array.isArray(data?.data)
        ? data.data
        : [];

    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      initiated: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      complete: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    const formatted = records.map((item, index) => {
      const date = new Date(item.created_at);

      return {
        // 🔑 REQUIRED FOR TABLE STATUS FILTER
        status: item.status?.toLowerCase() ?? "pending",

        id: item.id,
        user_id: item.user_id,

        sqno: (
          <div className="text-left">
            <b>{index + 1}</b>
            <div className="text-xs text-gray-600">
              {date.getDate()} {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
              <br />
              {date.toLocaleTimeString()}
            </div>
          </div>
        ),

        merchant_details: item.user?.name ?? "N/A",

        txnid: (
          <div className="text-left text-sm space-y-1">
            <div>Payment Mode: <b>{item.payout_mode ?? "N/A"}</b></div>
            <div>Account: <b>{item.payer_acc_no ?? "N/A"}</b></div>
            <div>Holder: <b>{item.payer_name ?? "N/A"}</b></div>
            <div>IFSC: <b>{item.payer_ifsc ?? "N/A"}</b></div>
            <div>UPI ID: <b>{item.payer_upi ?? "N/A"}</b></div>
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
            <div>Opening Wallet: <b>{item.payout_opening_balance ?? 0}</b></div>
            <div>Pay Amount: <b>{item.payout_amount ?? 0}</b></div>
            <div>Charges: <b>{item.payer_charges ?? 0}</b></div>
            <div>Total Debit: <b>{item.total_debit ?? 0}</b></div>
            <div>Closing Wallet: <b>{item.payout_closing_balance ?? 0}</b></div>
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
  }, [data]);

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
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">
          Error loading payout data
        </div>
      ) : (
        <Table
          columns={payoutColumns}
          data={payoutData}
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
