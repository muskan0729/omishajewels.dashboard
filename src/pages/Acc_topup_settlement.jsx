import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const LIMIT = 50;

const Acc_topup_settlement = () => {
  const [topupPayoutData, setTopupPayoutData] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);

  const query = cursor
    ? `/reportrecords-list?product[]=topup_payout&product[]=take_back_from_wallet&limit=${LIMIT}&cursor=${cursor}`
    : `/reportrecords-list?product[]=topup_payout&product[]=take_back_from_wallet&limit=${LIMIT}`;

  const { data, loading, error } = useGet(query);

  useEffect(() => {
    if (!data) return;

    // ✅ BACKEND RESPONSE
    const records =
      Array.isArray(data?.data) ? data.data : [];

    setNextCursor(data?.next_cursor ?? null);

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
        status: item.status?.toLowerCase() ?? "pending",
        id: item.id,
        user_id: item.user_id,

        sqno: index + 1,

        product_type: item.product ?? "N/A",
        merchant_details: item.user?.name ?? "N/A",
        txnid: item.txnid ?? "N/A",

        amount: item.amount ?? 0,

        payout_opening_balance: item.payout_opening_balance ?? "0.00",
        payout_closing_balance: item.payout_closing_balance ?? "0.00",

        date: `${date.getDate()} ${
          MONTH_NAMES[date.getMonth()]
        } ${date.getFullYear()} - ${date.toLocaleTimeString()}`,

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

    setTopupPayoutData(formatted);
  }, [data]);

  const columns = [
    { header: "SQ NO", accessor: "sqno" },
    { header: "ID", accessor: "id" },
    { header: "User ID", accessor: "user_id" },
    { header: "Product Type", accessor: "product_type" },
    { header: "Merchant", accessor: "merchant_details" },
    { header: "Txn ID", accessor: "txnid" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
    { header: "Date", accessor: "date" },
    { header: "Opening Bal", accessor: "payout_opening_balance" },
    { header: "Closing Bal", accessor: "payout_closing_balance" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-[#b58351] to-[#b6916d] rounded-lg p-4 shadow-md flex justify-between items-center">
        <h4 className="font-bold text-white text-xl">
          Topup Settlement Statement
        </h4>

        {/* CURSOR CONTROLS */}
        <div className="flex gap-2 hidden">
          <button
            disabled={!cursor}
            onClick={() => setCursor(null)}
            className="px-3 py-1 rounded bg-white text-[#3F2A20] disabled:opacity-50"
          >
            First
          </button>

          <button
            disabled={!nextCursor}
            onClick={() => setCursor(nextCursor)}
            className="px-3 py-1 rounded bg-white text-[#3F2A20] disabled:opacity-50"
          >
            Next
          </button>
        </div>
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
          columns={columns}
          data={topupPayoutData}
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

export default Acc_topup_settlement;