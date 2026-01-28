import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const UpiStatement = () => {
  const [upiData, setUpiData] = useState([]);

  const { data, loading, error } = useGet("/reportrecords-list?product=UPI");

  useEffect(() => {
    if (!data) return;

    // ✅ HANDLE BOTH RESPONSE SHAPES
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
        // ✅ REQUIRED FOR TABLE FILTERS
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
            <div>Payee VPA: <b>{item.payee_vpa ?? "N/A"}</b></div>
            <div>Payer Name: <b>{item.payer_name ?? "N/A"}</b></div>
            <div>Txn ID: <b>{item.txnid ?? "N/A"}</b></div>
          </div>
        ),

        amount: (
          <div className="text-left text-sm space-y-1">
            <div>Amount: <b>{item.amount ?? 0}</b></div>
            <div>GST: <b>{item.gst ?? 0}</b></div>
            <div>Charges: <b>{item.charge ?? 0}</b></div>
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

    setUpiData(formatted);
  }, [data]);

  const upiColumn = [
    { header: "SQ NO", accessor: "sqno" },
    { header: "Merchant Details", accessor: "merchant_details" },
    { header: "Payer / Payee Details", accessor: "txnid" },
    { header: "Amount / Charges", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#b58351] to-[#b6916d] rounded-lg p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">UPI Statement</h4>
      </div>

      {/* TABLE */}
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">
          Error loading data
        </div>
      ) : (
        <Table
          columns={upiColumn}
          data={upiData}
          showStatusFilter
          statusList={REPORT_STATUSES}
          showExport
          showSearch={false}
          showDeleteColumn={false}
          showSelectUserFilter
        />
      )}
    </div>
  );
};

export default UpiStatement;
