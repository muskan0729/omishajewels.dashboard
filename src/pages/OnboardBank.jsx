import { useState, useEffect } from "react";
import Button from "../components/Button";
import Table from "../components/Table";
import { BankModal } from "../components/BankModal";
import { useGet } from "../hooks/useGet";
import Toggle from "../components/Toggle";
import { usePost } from "../hooks/usePost";
import { TOGGLE_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const OnboardBank = () => {
  const [activeTab, setActiveTab] = useState("payin");
  const [bankData, setBankData] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const {
    data: payinbanks,
    refetch: payinRefetch,
    loading: payinLoading,
  } = useGet("/payinbanks-List");

  const {
    data: payoutbanks,
    refetch: payoutRefetch,
    loading: payoutLoading,
  } = useGet("/payoutbanks-List");

  const { execute: updatePayinToggle } = usePost("/update-payin-bank-status");
  const { execute: updatePayoutToggle } = usePost("/update-payout-bank-status");

  const handleModal = () => setShowModal((prev) => !prev);

  const handleStatusToggle = async (rowId, checked) => {
    try {
      let res;
      if (activeTab === "payin") {
        res = await updatePayinToggle({
          id: rowId,
          onboarded_payin_bank_status: checked,
        });
      } else {
        res = await updatePayoutToggle({
          id: rowId,
          onboarded_payout_bank_status: checked,
        });
      }

      if (res) {
        setBankData((prev) =>
          prev.map((item) =>
            item.id === rowId
              ? { ...item, status: checked ? "Active" : "Inactive" }
              : item
          )
        );
        activeTab === "payin" ? payinRefetch() : payoutRefetch();
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Format data based on active tab
  useEffect(() => {
    if (activeTab === "payin") {
      const mapped =
        payinbanks?.data?.map((item, index) => ({
          sqno: index + 1,
          id: item.id,
          bank_name: item.onboard_payin_bank,
          status: item.onboarded_payin_bank_status === 1 ? "Active" : "Inactive",
        })) || [];
      setBankData(mapped);
    } else {
      const mapped =
        payoutbanks?.data?.map((item, index) => ({
          sqno: index + 1,
          id: item.id,
          bank_name: item.onboard_payout_bank,
          status:
            item.onboarded_payout_bank_status === 1 ? "Active" : "Inactive",
        })) || [];
      setBankData(mapped);
    }
  }, [activeTab, payinbanks, payoutbanks]);

  const bankColumn = [
    { header: "SQ No", accessor: "sqno" },
    { header: "Bank Name", accessor: "bank_name" },
    {
      header: "Status",
      accessor: "status",
      Cell: ({ value, row }) => (
        <Toggle
          defaultChecked={value === "Active"}
          onChange={(checked) => handleStatusToggle(row.id, checked)}
        />
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d]  rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Onboard Bank</h4>
        <Button
          className="bg-white border border-sky-200 text-sky-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-50 hover:border-sky-300 transition-all duration-200"
          onClick={handleModal}
        >
          ADD BANK
        </Button>

      </div>

      {/* Tabs */}
      <div className="flex gap-4">
        <Button
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === "payin"
              ? "bg-blue-100 text-blue-600 shadow-md"
              : "bg-white text-gray-600 hover:bg-blue-50 transition"
            }`}
          onClick={() => setActiveTab("payin")}
        >
          Payin Bank List
        </Button>
        <Button
          className={`px-4 py-2 rounded-lg font-medium ${activeTab === "payout"
              ? "bg-blue-100 text-blue-600 shadow-md"
              : "bg-white text-gray-600 hover:bg-blue-50 transition"
            }`}
          onClick={() => setActiveTab("payout")}
        >
          Payout Bank List
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        {activeTab === "payin" ? (
          payinLoading ? <TableSkeleton /> : null
        ) : payoutLoading ? (
          <TableSkeleton />
        ) : null}

        {!payinLoading && !payoutLoading && (
          <Table
            columns={bankColumn}
            data={bankData}
            className="shadow-lg rounded-lg overflow-hidden border border-gray-200"
            rowClassName={(rowIndex) =>
              rowIndex % 2 === 0
                ? "bg-white hover:bg-blue-50"
                : "bg-gray-50 hover:bg-blue-50"
            }
            paginationClassName="flex justify-end gap-2 mt-4"
            previousClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
            nextClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
            showPagination={true}
            showStatusFilter={true}
            showExport={false}
            showSearch={true}
            showDateFilter={false}
            setData={setBankData}
            endPoint={
              activeTab === "payin" ? "/delete-payinbank" : "/delete-payoutbank"
            }
            refreshTable={activeTab === "payin" ? payinRefetch : payoutRefetch}
            statusList={TOGGLE_STATUSES}
          />
        )}
      </div>

      <BankModal
        showModal={showModal}
        handleModal={handleModal}
        activeTab={activeTab}
        refreshTable={activeTab === "payin" ? payinRefetch : payoutRefetch}
      />
    </div>
  );
};

export default OnboardBank;
