import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../components/Table";
import Toggle from "../components/Toggle";
import Button from "../components/Button";
import { SchemeModal } from "../components/SchemeModal";
import useAutoFetch from "../hooks/useAutoFetch";
import { usePut } from "../hooks/usePut";
import { MONTH_NAMES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";



export const Member = () => {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const memberDetails = useNavigate();
  const [merchantData, setMerchantData] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);


  const { executePut: updateSingle } = usePut("/update-user-statuses");
  const { executePut: updateAll } = usePut("/payin-payout-statuses");
  const { execute: updateCredential } = usePost("/update-credential");

  const handleCredentialChange = async (merchantId, credentialId) => {
    try {
      const res = await updateCredential({
        id: merchantId,
        credentials_id: Number(credentialId),
      });
      toast.success("MID Updated Successfully!");
      refetchOfMerchants();
    } catch (err) {
      console.error(err);
      toast.error("Error updating MID");
    }
  };

  const { data: dataOfMerchants, refetch: refetchOfMerchants, loading: merchantLoading } =
    useAutoFetch("/get-merchants", 20000);

    console.log("payoutdata", dataOfMerchants);
  const { data: credentialsData } = useGet("/credentials");


  const initialDataOfMerchants = useMemo(() => dataOfMerchants?.data ?? [], [dataOfMerchants]);

  useEffect(() => {
    if (!merchantLoading && dataOfMerchants) setInitialLoad(false);
  }, [merchantLoading, dataOfMerchants]);

  const handlePayinToggle = async (v, rowId, accountStatus) => {
    try {
      if (accountStatus) await updateSingle({ user_id: rowId, payin_status: v });
    } catch (err) {
      console.log("Payin Toggle Failed: ", err);
    }
  };

  const handlePayoutToggle = async (v, rowId, accountStatus) => {
    try {
      if (accountStatus) await updateSingle({ user_id: rowId, payout_status: v });
    } catch (err) {
      console.log("Payout Toggle Failed: ", err);
    }
  };

  const handleAccountToggle = async (v, rowId) => {
    try {
      const response = await updateSingle({
        user_id: rowId,
        payin_status: false,
        payout_status: false,
        account_status: v,
      });
      if (response) refetchOfMerchants();
    } catch (err) {
      console.log("Account Toggle Failed: ", err);
    }
  };

  const handleAllPayinToggle = async (v) => {

    try {
      const x = v ? 1 : 0;
      const response = await updateAll({ payin_status: x });

      if (response) {
        setMerchantData((prev) =>
          prev.map((item) => ({ ...item, payin: item.account ? v : false }))
        );
      }
    } catch (err) {
      console.log("All Payin Toggle Failed: ", err);
    }
  };

  const handleAllPayoutToggle = async (v) => {

    try {
      const x = v ? 1 : 0;
      const response = await updateAll({ payout_status: x });

      if (response) {
        setMerchantData((prev) =>
          prev.map((item) => ({ ...item, payout: item.account ? v : false }))
        );
      }
    } catch (err) {
      console.log("All Payout Toggle Failed: ", err);
    }
  };



  useEffect(() => {
    if (!initialDataOfMerchants || !credentialsData) return;

    const credentialsList = Array.isArray(credentialsData) ? credentialsData : credentialsData.data || [];

    const formattedMerchantData = initialDataOfMerchants.map((item, index) => {
      const credential = credentialsList.find((cred) => cred.id === item.credentials_id);

      const payinBank =
        item.payin_at_onboard === "Airpay" ? (
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">Airpay</span>
            <select
              value={item.credentials_id || ""}
              onChange={(e) => handleCredentialChange(item.id, e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none"
            >
              <option value="">Select MID</option>
              {credentialsData?.data?.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          item.payin_at_onboard
        );

      return {
        sqno: index + 1,
        id: item.id,
        // name: item.name,
        name:(
        <span className="text-blue-600 cursor-pointer" 
        
        onClick={() => {
          localStorage.setItem("merchantId", item.id);
          memberDetails(`/MerchantDetails/${item.id}`) 
        }}>
        
          {item.name}
        </span>
        ),
        payin_bank: payinBank,
        payin: item.payin_status,
       
        payout: item.payout_status,
     payincharge: Number(item.total_charge?.UPI || 0).toFixed(2),
payoutcharge: Number(item.total_charge?.payout || 0).toFixed(2),
cryptocharge: Number(item.total_charge?.CRYPTO || 0).toFixed(2),

  totalwalletpayin: Number(item.total_amount?.UPI || 0).toFixed(2),
totalwalletpayout: Number(item.total_amount?.payout || 0).toFixed(2),
totalwallet: Number(item.total_payout || 0).toFixed(2),
        account: item.account_status,

        walletpayin: item.payin_wallet,
        walletpayout: item.payout_wallet,
        date:
          new Date(item.created_at).getDate() +
          " " +
          MONTH_NAMES[new Date(item.created_at).getMonth()] +
          " " +
          new Date(item.created_at).getFullYear(),
      };
    });

    setMerchantData(formattedMerchantData);
  }, [initialDataOfMerchants, credentialsData]);

  const memberColumns = [
    { header: "SQNo", accessor: "sqno" },
    { header: "Name", accessor: "name" },
    { header: "Payin", accessor: "payin" },
 
    { header: "Payout", accessor: "payout" },
    
    { header: "Payin Wallet", accessor: "walletpayin" },
    { header: "Payout Wallet", accessor: "walletpayout" },
    { header: "Total Payin Wallet", accessor: "totalwalletpayin" },
         { header: "Payin Charge", accessor: "payincharge" },
      { header: "Total Payout Wallet", accessor: "totalwalletpayout" },
         { header: "Payout Charge", accessor: "payoutcharge" },
      { header: "Total Wallet", accessor: "totalwallet" },


    { header: "Payin Onboarded Bank", accessor: "payin_bank" },
  ];

  const tableDataWithActions = merchantData?.map((row) => ({
    ...row,
    payin: (
      <Toggle
        defaultChecked={row.payin}
        onChange={(v) => handlePayinToggle(v, row.id, row.account)}
        disabled={!row.account}
      />
    ),
    payout: (
      <Toggle
        defaultChecked={row.payout}
        onChange={(v) => handlePayoutToggle(v, row.id, row.account)}
        disabled={!row.account}
      />
    ),
    sqno: (
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{row.sqno}</span>
        <Toggle
          defaultChecked={row.account}
          onChange={(v) => handleAccountToggle(v, row.id)}
          className="mt-1"
        />
        <span className="text-xs text-blue-400 font-semibold mt-1">{row.date}</span>
      </div>
    ),
  }));

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-t from-sky-500 to-indigo-500 rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Member List</h4>
        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">All Payin ON/OFF</span>
          <Toggle onChange={handleAllPayinToggle} />
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-white">All Payout ON/OFF</span>
          <Toggle onChange={handleAllPayoutToggle} />
        </div>

        <Button
          onClick={() => navigate("/member-create")}
          className="bg-white border border-sky-200 text-sky-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-50 hover:border-sky-300 transition-all duration-200"
        >
          + Create New
        </Button>

      </div>

      {/* Table */}
      {initialLoad ? (
        <TableSkeleton />
      ) : (
        <Table
          columns={memberColumns}
          data={tableDataWithActions}
          className="shadow-lg rounded-lg overflow-hidden border border-gray-200"
          rowClassName={(rowIndex) =>
            rowIndex % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"
          }
          paginationClassName="flex justify-end gap-2 mt-4"
          previousClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
          nextClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
          endPoint="/delete-merchant"
          setData={setMerchantData}
        />
      )}

      <SchemeModal showModal={showModal} handleModal={() => setShowModal(!showModal)} />
    </div>
  );
};
