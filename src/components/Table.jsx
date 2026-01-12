/* eslint-disable no-undef */
import { useState, useMemo, useEffect, useRef } from "react";
import Button from "./Button";
import { ConfirmModal } from "./ConfirmModal";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CustomSelect } from "./CustomSelect";

const Table = ({
  columns,
  data,
  showSearch = true,
  showPagination = true,
  showExport = true,
  showStatusFilter = true,
  showDeleteColumn = true,
  showDateFilter = true,
  showSelectUserFilter = false,
  endPoint = "",
  refreshTable,
  setData,
  statusList,
}) => {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [openExport, setOpenExport] = useState(false);
  const exportRef = useRef(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectData, setSelectData] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  useEffect(() => {
    const dataForSelect = Array.from(
      new Map(
        data?.map((item) => [
          item.user_id,
          { value: item.user_id, label: item.merchant_details },
        ])
      ).values()
    );
    setSelectData(dataForSelect);
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportRef.current && !exportRef.current.contains(event.target)) {
        setOpenExport(false);
      }
    };

    const handleScroll = () => {
      setOpenExport(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const handleConfirmModal = (id) => {
    setRecordId(id);
    setShowConfirmModal(true);
  };

  const modifiedEndpoint = endPoint && recordId ? `${endPoint}/${recordId}` : null;
  const { execute: deleteRecord } = usePost(modifiedEndpoint || "");

  const handleDelete = async (e) => {
    e?.preventDefault();
    if (!recordId || !modifiedEndpoint) return;

    try {
      const res = await deleteRecord({});
      if (res) {
        toast.success("Record deleted successfully!");
        if (setData) {
          setData((prev) => prev.filter((row) => row.id !== recordId));
        }
        if (refreshTable) refreshTable();
        setShowConfirmModal(false);
        setRecordId(null);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  // const filteredData = useMemo(() => {
  //   return data?.filter((row) => {
  //     // const matchesSearch = Object.values(row).some((val) =>
  //     //   String(val).toLowerCase().includes(search.toLowerCase())
  //     // );
  //     const matchesSearch = (() => {
  //       const searchText = search.toLowerCase();

  //       return (
  //         row.id?.toString().toLowerCase().includes(searchText) ||
  //         row.user_id?.toString().toLowerCase().includes(searchText) ||
  //         row.merchant_details?.toLowerCase().includes(searchText)
  //       );
  //     })();


  //     const matchesStatus =
  //       !statusFilter ||
  //       statusFilter === "all" ||
  //       String(row.status).toLowerCase() === statusFilter.toLowerCase();

  //     const rowDate = new Date(row.date?.split("-")[0]);
  //     const matchesDate =
  //       (!startDate || rowDate >= startDate) &&
  //       (!endDate || rowDate <= endDate);

  //     const matchesMerchant =
  //       !selectedMerchant || row.user_id === selectedMerchant.value;

  //     setCurrentPage(1);
  //     return (
  //       matchesSearch &&
  //       matchesStatus &&
  //       matchesDate &&
  //       matchesMerchant
  //     );
  //   });
  // }, [search, statusFilter, startDate, endDate, selectedMerchant, data]);

  const filteredData = useMemo(() => {
  // 🟢 DASHBOARD MODE (jab koi filter visible hi nahi hai)
  if (
    !showSearch &&
    !showStatusFilter &&
    !showDateFilter &&
    !showSelectUserFilter
  ) {
    return data || [];
  }

  // 🔵 NORMAL MODE (Admin / Reports pages)
  return data?.filter((row) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      !search ||
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchText)
      );

    const matchesStatus =
      !statusFilter ||
      statusFilter === "all" ||
      String(row.status).toLowerCase() === statusFilter.toLowerCase();

    setCurrentPage(1);

    return matchesSearch && matchesStatus;
  });
}, [
  data,
  search,
  statusFilter,
  showSearch,
  showStatusFilter,
  showDateFilter,
  showSelectUserFilter,
]);


  const totalSuccessAmount = useMemo(() => {
    if (!filteredData?.length) return 0;

    return filteredData
      .filter(
        (row) => String(row.status).toLowerCase() === "success"
      )
      .reduce(
        (sum, row) =>
          sum + (isNaN(row.numericAmount) ? 0 : row.numericAmount),
        0
      );
  }, [filteredData]);

  // ✅ Export functions
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = columns.map((c) => c.header).join(",");
    const rows = filteredData
      .map((row) => columns.map((c) => `"${row[c.accessor] ?? ""}"`).join(","))
      .join("\n");
    downloadFile(`${headers}\n${rows}`, "table.csv", "text/csv");
  };

  const exportJSON = () => {
    downloadFile(JSON.stringify(filteredData, null, 2), "table.json", "application/json");
  };

  const exportTXT = () => {
    const headers = columns.map((c) => c.header).join(" | ");
    const rows = filteredData
      .map((row) => columns.map((c) => row[c.accessor]).join(" | "))
      .join("\n");
    downloadFile(`${headers}\n${rows}`, "table.txt", "text/plain");
  };

  const exportSQL = () => {
    const tableName = "export_table";
    const sqlRows = filteredData
      .map((row) => {
        const values = columns
          .map((c) => {
            const val = row[c.accessor];
            if (val === null || val === undefined) return "NULL";
            if (typeof val === "number") return val;
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(", ");
        return `INSERT INTO ${tableName} (${columns.map((c) => c.accessor).join(", ")}) VALUES (${values});`;
      })
      .join("\n");
    downloadFile(sqlRows, "table.sql", "text/sql");
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = Array.from({ length: 20 }, (_, i) => 2020 + i);

  // eslint-disable-next-line no-unused-vars
  const customHeader = ({ date, changeMonth, changeYear }) => (
    <div className="flex justify-between items-center px-2 py-1 bg-gradient-to-r from-sky-200 to-indigo-200 rounded-t-lg">
      <select
        value={months[date.getMonth()]}
        onChange={(e) => changeMonth(months.indexOf(e.target.value))}
        className="bg-white text-sky-800 rounded px-2 py-1 border border-sky-300"
      >
        {months.map((month) => (
          <option key={month}>{month}</option>
        ))}
      </select>

      <select
        value={date.getFullYear()}
        onChange={(e) => changeYear(Number(e.target.value))}
        className="bg-white text-sky-800 rounded px-2 py-1 border border-sky-300"
      >
        {years.map((year) => (
          <option key={year}>{year}</option>
        ))}
      </select>
    </div>
  );

return (
  <div className="w-full">

    {/* FILTER BAR */}
    {(showSearch || showStatusFilter || showExport || showDateFilter || showSelectUserFilter) && (
      <div
        className="
          w-full 
          bg-gradient-to-br from-[#f1d9b7] via-[#f8e9d4] to-[#e6d5b8] 
          border border-[#d7c4a8] 
          rounded-2xl 
          shadow-xl 
          p-5 
          mb-8
        "
      >
        {/* FILTER ROW */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

          {/* LEFT FILTERS */}
          <div className="flex flex-wrap items-center gap-4">

            {/* 🔍 SEARCH */}
            {showSearch && (
              <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[#9c8a78]"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  className="
                    w-56 pl-10 pr-3 py-2 
                    bg-white 
                    border border-[#d7c4a8] 
                    rounded-xl 
                    shadow-sm 
                    text-[#4d443b]
                    placeholder:text-[#b8a898]
                    focus:ring-2 focus:ring-[#b58351]
                  "
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}

            {/* MERCHANT SELECT */}
            {showSelectUserFilter && (
              <div className="w-56">
                <CustomSelect
                  options={selectData}
                  placeholder="Select Merchant"
                  value={selectedMerchant}
                  onChange={(option) => setSelectedMerchant(option)}
                />
              </div>
            )}

            {/* DATES */}
            {showDateFilter && (
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  className="
                    w-40 px-3 py-2 
                    bg-white
                    border border-[#d7c4a8] 
                    rounded-xl 
                    shadow-sm 
                    text-[#4d443b]
                    placeholder:text-[#b19e8a]
                    focus:ring-2 focus:ring-[#b58351]
                  "
                  placeholderText="Start Date"
                />
                <span className="text-[#9c8a78] font-semibold">—</span>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  minDate={startDate}
                  className="
                    w-40 px-3 py-2 
                    bg-white
                    border border-[#d7c4a8] 
                    rounded-xl 
                    shadow-sm 
                    text-[#4d443b]
                    placeholder:text-[#b19e8a]
                    focus:ring-2 focus:ring-[#b58351]
                  "
                  placeholderText="End Date"
                />
              </div>
            )}

            {/* STATUS */}
            {showStatusFilter && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="
                  px-3 py-2 
                  border border-[#d7c4a8]
                  rounded-xl 
                  bg-white 
                  shadow-sm 
                  text-[#4d443b]
                  focus:ring-2 focus:ring-[#b58351]
                "
              >
                <option value="all">All</option>
                {statusList?.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* RIGHT BUTTONS */}
          <div className="flex items-center gap-3 ml-auto">

            {/* EXPORT BTN */}
            {showExport && (
              <div className="relative" ref={exportRef}>
                <button
                  onClick={() => setOpenExport(!openExport)}
                  className="
                    bg-gradient-to-r from-[#b58351] to-[#d7a874] 
                    text-white
                    px-4 py-2 
                    rounded-xl 
                    shadow-lg 
                    hover:shadow-xl 
                    hover:brightness-110 
                    transition 
                    flex items-center gap-2 
                    min-w-[110px] h-[42px]
                  "
                >
                  <i className="fa-solid fa-download"></i> Export
                </button>

                {/* EXPORT MENU */}
                {openExport && (
                  <div
                    className="
                      absolute right-0 mt-2 bg-white 
                      border border-[#d7c4a8] 
                      rounded-xl 
                      shadow-xl 
                      p-2 
                      w-40 z-30
                    "
                  >
                    <button className="gold-option w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md" onClick={exportCSV}>CSV</button>
                    <button className="gold-option w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md" onClick={exportJSON}>JSON</button>
                    <button className="gold-option w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md" onClick={exportTXT}>TEXT</button>
                    <button className="gold-option w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md" onClick={exportSQL}>SQL</button>
                  </div>
                )}
              </div>
            )}

            {/* CLEAR BUTTON */}
            <Button
              className="
                bg-[#f1d9b7] 
                text-[#4d443b] 
                px-4 py-2 
                rounded-xl 
                shadow-md 
                hover:bg-[#e9cdaa]
                transition 
                min-w-[110px] h-[42px]
              "
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setStatusFilter("all");
                setSearch("");
                setSelectedMerchant(null);
              }}
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* SUCCESS AMOUNT */}
        {showSelectUserFilter && (
          <div className="flex justify-end mt-3">
            <div className="
              bg-green-50 
              border border-green-300 
              text-green-700 
              px-4 py-2 
              rounded-xl 
              text-sm 
              shadow-sm 
              flex items-center gap-2
            ">
              <i className="fa-solid fa-circle-check"></i>
              Total Successful: ₹{totalSuccessAmount.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    )}

    {/* TABLE SECTION */}
    <div className="w-full space-y-5">
      {filteredData.length > 0 ? (
        filteredData
          .slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage)
          .map((row) => (
            <div
              key={row.id}
              className="
                bg-gradient-to-br from-white to-[#faf4ec]
                border border-[#e6ded4]
                rounded-2xl 
                shadow-lg 
                p-5 
                hover:shadow-xl 
                hover:scale-[1.01] 
                transition
              "
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {columns.map((col, i) => (
                  <div key={i}>
                    <p className="text-xs text-[#9c8a78] font-semibold uppercase tracking-wide">
                      {col.header}
                    </p>
                    <p className="text-[#4d443b] text-sm mt-1">
                      {col.Cell ? col.Cell({ value: row[col.accessor], row }) : row[col.accessor]}
                    </p>
                  </div>
                ))}
              </div>

              {showDeleteColumn && (
                <div className="flex justify-end mt-4">
                  <Button
                    type="button"
                    className="
                      bg-red-100 text-red-600 
                      px-3 py-2 
                      rounded-xl 
                      hover:bg-red-200 
                      transition
                    "
                    onClick={() => handleConfirmModal(row.id)}
                  >
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </div>
              )}
            </div>
          ))
      ) : (
        <div
          className="
            text-center 
            text-[#4d443b] 
            py-6 
            bg-gradient-to-br from-white to-[#faf4ec] 
            border border-[#e6ded4] 
            rounded-2xl 
            shadow-sm
          "
        >
          No data found
        </div>
      )}

      {/* PAGINATION */}
      {showPagination && (
        <div
          className="
            flex flex-col md:flex-row justify-between items-center 
            bg-gradient-to-br from-[#faf4ec] to-[#f8efe4]
            border border-[#e6ded4] 
            rounded-2xl 
            shadow-md 
            px-4 py-3 
            mt-3
          "
        >
          {/* ENTRIES */}
          <div className="flex items-center gap-2 text-[#4d443b]">
            Show
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="
                border border-[#d7c4a8] 
                rounded-lg px-2 py-1 
                bg-white 
                text-[#4d443b] 
                shadow-sm
              "
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            entries
          </div>

          {/* PAGINATION BUTTONS */}
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`
                px-4 py-1 rounded-xl text-sm transition
                ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white hover:brightness-110"
                }
              `}
            >
              Prev
            </Button>

            <span className="text-[#4d443b]">
              Page <strong>{currentPage}</strong>
            </span>

            <Button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(filteredData.length / entriesPerPage)
                    ? prev + 1
                    : prev
                )
              }
              disabled={currentPage === Math.ceil(filteredData.length / entriesPerPage)}
              className={`
                px-4 py-1 rounded-xl text-sm transition
                ${
                  currentPage === Math.ceil(filteredData.length / entriesPerPage)
                    ? "bg-gray-200 text-gray-500"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white hover:brightness-110"
                }
              `}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>

    {/* CONFIRM MODAL */}
    <ConfirmModal
      showConfirmModal={showConfirmModal}
      handleConfirmModal={() => setShowConfirmModal(false)}
      action={handleDelete}
      heading="Confirm Delete"
      body="Are you sure you want to delete this record?"
    />
  </div>
);

};

export default Table;
