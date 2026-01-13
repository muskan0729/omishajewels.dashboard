import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const Acc_upi_setlement = () => {
  const [payinSettlementData, setPayinSettlementData] = useState([]);

  const { data, loading, error } = useGet(
    "/reportrecords-List?product=payin_settlement"
  );

  useEffect(() => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      initiated: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      complete: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      reversed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };

    // Safely get the nested data array from API response
    const records = Array.isArray(data?.data?.data) ? data.data.data : [];

    const formattedData = records.map((item, index) => ({
      sqno: index + 1,
      id: item.id,
      user_id: item.user_id,
      product_type: item.product ?? "N/A",
      merchant_details: item.user?.name ?? "N/A",
      txnid: item.txnid ?? "N/A",
      amount: item.amount ?? "N/A",

      // Numeric value for calculations
      numericAmount: parseFloat(item.amount) || 0,

      date:
        new Date(item.created_at).getDate() +
        " " +
        MONTH_NAMES[new Date(item.created_at).getMonth()] +
        " " +
        new Date(item.created_at).getFullYear() +
        " - " +
        new Date(item.created_at).toLocaleTimeString(),
      status: item.status,
      showstatus: (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            statusClasses[item.status] ?? "bg-gray-100 text-gray-800"
          }`}
        >
          {item?.status
            ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
            : "N/A"}
        </span>
      ),
    }));

    setPayinSettlementData(formattedData);
  }, [data]);

  const payinSettlementColumn = [
    { header: "SQ NO", accessor: "sqno" },
    { header: "Id", accessor: "id" },
    { header: "User Id", accessor: "user_id" },
    { header: "Product Type", accessor: "product_type" },
    { header: "Merchant Details", accessor: "merchant_details" },
    { header: "Transaction Id", accessor: "txnid" },
    { header: "Amount", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
    { header: "Date", accessor: "date" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d] rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-lg sm:text-xl">
          Payin Settlement Statement
        </h4>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500 text-sm sm:text-base">
          Error: {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            columns={payinSettlementColumn}
            data={payinSettlementData}
            showStatusFilter={true}
            showExport={true}
            showSearch={false}
            showSelectUserFilter={true}
            showDateFilter={true}
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
