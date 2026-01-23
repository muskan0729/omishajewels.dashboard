import { useState, useEffect } from "react";
import Table from "../components/Table";
import { SchemeModal } from "../components/SchemeModal";
import Toggle from "../components/Toggle";
import Button from "../components/Button";
import { useGet } from "../hooks/useGet";
import { usePost } from "../hooks/usePost";
import { TOGGLE_STATUSES } from "../constants/Constants";
import { TableSkeleton } from "../components/TableSkeleton";

const Scheme = () => {
  const [showModal, setShowModal] = useState(false);
  const [schemedata, setSchemeData] = useState([]);
  const [editData, setEditData] = useState(null);

  const { data, loading, error, refetch } = useGet("/get-scheme");
  const { execute: updateStatus } = usePost("/update-scheme-status");

  const StatusToggle = ({ id, value, sqno, onToggle }) => {
    const handleChange = (checked) => {
      if (onToggle) onToggle(id, sqno, checked);
    };
    return (
      <Toggle defaultChecked={value === "Active"} onChange={handleChange} />
    );
  };

  useEffect(() => {
    if (data?.data) {
      const formattedData = data.data.map((item, index) => ({
        id: item.id,
        sqno: index + 1,
        name: item.name,
        status: item.status ? "Active" : "Inactive",
        action: (
          <Button
            onClick={() => handleEdit(item)}
            className="bg-[#b58351] hover:bg-[#615141] text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-md transition"
          >
            Edit
          </Button>
        ),
      }));
      setSchemeData(formattedData);
    }
  }, [data]);

  const handleModal = () => {
    setShowModal((prev) => !prev);
    if (showModal) setEditData(null);
  };

  const handleEdit = (scheme) => {
    setEditData(scheme);
    setShowModal(true);
  };

  const handleStatusToggle = async (id, sqno, checked) => {
    const res = await updateStatus({ scheme_id: id, status: checked });
    if (res) {
      setSchemeData((prev) =>
        prev.map((item) =>
          item.sqno === sqno
            ? { ...item, status: checked ? "Active" : "Inactive" }
            : item,
        ),
      );
    }
  };

  const schemecolumn = [
    { header: "SQ No", accessor: "sqno" },
    { header: "Name", accessor: "name" },
    {
      header: "Status",
      accessor: "status",
      Cell: ({ value, row }) => (
        <StatusToggle
          value={value}
          sqno={row.sqno}
          id={row.id}
          onToggle={handleStatusToggle}
        />
      ),
    },
    { header: "Action", accessor: "action" },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-t from-[#b58351] to-[#b6916d] rounded-lg flex justify-between items-center p-4 shadow-md">
        <h4 className="font-bold text-white text-xl">Scheme Manager</h4>
        <Button
          className="bg-[#e8bb6e] border border-[#b5895c] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-[#ebaa69] hover:border-[#b5895c] transition-all duration-200 cursor-pointer"
          onClick={handleModal}
        >
          ADD NEW
        </Button>
      </div>

      <SchemeModal
        showModal={showModal}
        handleModal={handleModal}
        editData={editData}
        refreshTable={refetch}
      />

      {/* Table */}
      {loading ? (
        <TableSkeleton />
      ) : error ? (
        <div className="text-center py-6 text-red-500">Error: {error}</div>
      ) : (
        <Table
          columns={schemecolumn}
          data={schemedata}
          className="shadow-lg rounded-lg overflow-hidden border border-gray-200"
          rowClassName={(rowIndex) =>
            rowIndex % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
          paginationClassName="flex justify-end gap-2 mt-4"
          previousClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
          nextClassName="bg-[#b58351] hover:bg-[#615141] text-white px-3 py-1 rounded-md shadow-sm cursor-pointer transition"
          showDateFilter={false}
          endPoint="/delete-scheme"
          refreshTable={refetch}
          statusList={TOGGLE_STATUSES}
        />
      )}
    </div>
  );
};

export default Scheme;
