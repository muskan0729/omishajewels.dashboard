import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const LIMIT = 50;

const Acc_upi_setlement = () => {
  const [payinSettlementData, setPayinSettlementData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  const query = cursor
    ? `/reportrecords-list?product=payin_settlement&limit=${LIMIT}&cursor=${cursor}`
    : `/reportrecords-list?product=payin_settlement&limit=${LIMIT}`;

  const { data, loading, error } = useGet(query);

  useEffect(() => {
    if (!data) return;

    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      initiated: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      complete: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    // ✅ Expect backend: { data: [...], next_cursor: "xyz" }
    const records = Array.isArray(data?.data) ? data.data : [];

    console.log("records", records);

    setNextCursor(data?.next_cursor ?? null);

    const formattedData = records.map((item, index) => {
      const date = new Date(item.created_at);

      return {
        sqno: index + 1,
        id: item.id,
        user_id: item.user_id,
        product_type: item.product ?? "N/A",
        // merchant_details: item.user?.name ?? "N/A",
        merchant_details: `${item.user?.name ?? "N/A"} (${item.user_id ?? "N/A"})`,
        txnid: item.txnid ?? "N/A",
        amount: item.amount ?? "0.00",

        payin_opening_balance: item.payin_opening ?? "0.00",
        payin_closing_balance: item.payin_closing ?? "0.00",

        numericAmount: parseFloat(item.amount) || 0,

        date: (
          <div className="flex flex-col leading-tight">
            <span>
              {date.getDate()} {MONTH_NAMES[date.getMonth()]}{" "}
              {String(date.getFullYear()).slice(-2)}
            </span>
            <span className="text-xs text-gray-500">
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        ),

        status: item.status,

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

    setPayinSettlementData(formattedData);
  }, [data]);

  const payinSettlementColumn = [
    // { header: "SQ NO", accessor: "sqno" },
    { header: "SQ NO", accessor: "id" },
    { header: "Merchant", accessor: "merchant_details" },
    // { header: "User ID", accessor: "user_id" },
    { header: "Product Type", accessor: "product_type" },

    { header: "Txn ID", accessor: "txnid" },
    { header: "Date", accessor: "date" },
    { header: "Amount", accessor: "amount" },
    { header: "Opening Bal", accessor: "payin_opening_balance" },
    { header: "Closing Bal", accessor: "payin_closing_balance" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* HEADER + CURSOR CONTROLS */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d] rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-lg sm:text-xl">
          Payin Settlement Statement
        </h4>

        <div className="flex gap-2 hidden">
          <button
            disabled={!cursor}
            onClick={() => setCursor(null)}
            className="px-3 py-1 bg-white rounded text-[#3F2A20] disabled:opacity-50"
          >
            First
          </button>

          <button
            disabled={!nextCursor}
            onClick={() => setCursor(nextCursor)}
            className="px-3 py-1 bg-white rounded text-[#3F2A20] disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500 text-sm sm:text-base">
          Error loading data
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={payinSettlementColumn}
            data={payinSettlementData}
            rawData={data?.data || []} // ✅ ADD THIS
            exportType="payin_settlement" // ✅ ADD THIS
            showStatusFilter
            showExport
            showSearch={false}
            showSelectUserFilter
            showDateFilter
            showDeleteColumn={false}
            statusList={REPORT_STATUSES}
            className="shadow-lg rounded-lg overflow-hidden min-w-[700px] sm:min-w-full"
          />
        </div>
      )}
    </div>
  );
};

export default Acc_upi_setlement;
