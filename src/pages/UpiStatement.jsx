import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const UpiStatement = () => {
  const [upiData, setUpiData] = useState([]);

  const { data, loading, error } = useGet("/reportrecords-List?product=UPI");

  // 🔥 Same date format as ACC_TOPUP_SETTLEMENT.jsx
  const formatDateLikeTopup = (date) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const time = d.toLocaleTimeString();

    // EXAMPLE OUTPUT:
    // "12 Jan 2024 - 10:22:33 AM"
    return `${day} ${month} ${year} - ${time}`;
  };

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

    if (data?.data) {
      const formattedData = data.data.map((item, index) => ({
        sqno: (
          <div className="flex flex-col text-left">
            <span><b>{index + 1}</b></span>
            <span>
              {new Date(item.created_at).getDate()}{" "}
              {MONTH_NAMES[new Date(item.created_at).getMonth()]}{" "}
              {new Date(item.created_at).getFullYear()} <br />
              {new Date(item.created_at).toLocaleTimeString()}
            </span>
          </div>
        ),

        id: item.id,
        user_id: item.user_id,
        product_type: item.product ?? "N/A",
        merchant_details: item.user.name ?? "N/A",

        txnid: (
          <div className="flex flex-col text-left">
            <span>Payee VPA: <b>{item.payee_vpa ?? "null"}</b></span>
            <span>Payee Name: <b>{item.payer_name ?? "null"}</b></span>
            <span>Payee Txnid: <b>{item.mytxnid}</b></span>
            <span>TxnId: <b>{item.txnid}</b></span>
          </div>
        ),

        amount: (
          <div className="flex flex-col text-left">
            <span>Amount: <b>{item.amount}</b></span>
            <span>GST: <b>{item.gst}</b></span>
            <span>Charges: <b>{item.charge}</b></span>
            <span>Payin Rolling Amount: <b>{item.payin_rolling_amount}</b></span>
          </div>
        ),

        // 🟩 For amount calculations
        numericAmount: parseFloat(item.amount) || 0,

        // 🟦 THIS IS THE IMPORTANT FIX
        date: formatDateLikeTopup(item.created_at),

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

      setUpiData(formattedData);
    }
  }, [data]);

  const upiColumn = [
    { header: "SQ NO", accessor: "sqno" },
    { header: "Merchant Details", accessor: "merchant_details" },
    { header: "Payer-Payee Details", accessor: "txnid" },
    { header: "Amount/ Commission", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Upi Statement</h4>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">Error: {error}</div>
      ) : (
        <Table
          columns={upiColumn}
          data={upiData}
          showStatusFilter={true}
          showExport={true}
          showSearch={false}
          showDeleteColumn={false}
          showSelectUserFilter={true}
          statusList={REPORT_STATUSES}
          className="shadow-lg rounded-lg overflow-hidden"
        />
      )}
    </div>
  );
};

export default UpiStatement;
