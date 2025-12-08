import { useState, useEffect } from "react";
import Table from "../components/Table";
import { useGet } from "../hooks/useGet";
import { MONTH_NAMES, REPORT_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const PayoutStatement = () => {
  const [payoutData, setPayoutData] = useState([]);

  const { data, loading, error } = useGet("/reportrecords-List?product=payout");

  // SAME DATE FORMAT AS ACC_TOPUP
  const formatDateLikeTopup = (date) => {
    const d = new Date(date);

    const day = d.getDate();
    const month = MONTH_NAMES[d.getMonth()];
    const year = d.getFullYear();
    const time = d.toLocaleTimeString();

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
              {new Date(item.created_at).getFullYear()} -{" "}
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
            <span>Payment Mode: <b>{item.payout_mode ?? "null"}</b></span>
            <span>Account: <b>{item.payer_acc_no}</b></span>
            <span>Holder: <b>{item.payer_name}</b></span>
            <span>IFSC: <b>{item.payer_ifsc}</b></span>
            <span>UPI Id: <b>{item.payer_upi ?? "N/A"}</b></span>
            <span>Mobile: <b>{item.payer_mobile}</b></span>
          </div>
        ),

        reference_details: (
          <div className="flex flex-col text-left">
            <span>Ref No: <b>{item.refno ?? "null"}</b></span>
            <span>Order ID: <b>{item.mytxnid}</b></span>
            <span>Txnid: <br /><b>{item.txnid}</b></span>
          </div>
        ),

        amount: (
          <div className="flex flex-col text-left">
            <span>Opening Wallet Amount: <b>{item.payout_opening_balance ?? "0"}</b></span>
            <span>Pay Amount: <b>{item.payout_amount}</b></span>
            <span>Total Charges: <b>{item.payer_charges ?? 0}</b></span>
            <span>Total Debited Amount: <b>{item.total_debit ?? 0}</b></span>
            <span>Closing Wallet Amount: <b>{item.payout_closing_balance ?? 0}</b></span>
            <span>Note: <b>{item.note ?? "-"}</b></span>
          </div>
        ),

        numericAmount: parseFloat(item.payout_amount) || 0,

        // FIXED DATE FORMAT
        date: formatDateLikeTopup(item.created_at),

        status: item.status,

        showstatus: (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${statusClasses[item.status] ?? "bg-gray-100 text-gray-800"}`}
          >
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "N/A"}
          </span>
        ),
      }));

      setPayoutData(formattedData);
    }
  }, [data]);

  const upiColumn = [
    { header: "Order ID", accessor: "sqno" },
    { header: "User Details", accessor: "merchant_details" },
    { header: "Bank Details", accessor: "txnid" },
    { header: "Reference Details", accessor: "reference_details" },
    { header: "Amount/commission", accessor: "amount" },
    { header: "Status", accessor: "showstatus" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Payout Statement</h4>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">Error: {error}</div>
      ) : (
        <Table
          columns={upiColumn}
          data={payoutData}
          showStatusFilter={true}
          showExport={true}
          showSearch={false}
          showSelectUserFilter={true}
          showDeleteColumn={false}
          statusList={REPORT_STATUSES}
          className="shadow-lg rounded-lg overflow-hidden"
        />
      )}
    </div>
  );
};

export default PayoutStatement;
