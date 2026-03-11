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
  data = [],
  rawData = [], // ✅ raw data for search/export
  exportType = "upi", // ✅ ADD THIS
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
  statusList = [],
}) => {
  const [role] = useState(atob(localStorage.getItem("role")) || "admin");
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10); // ✅ default 10
  const [currentPage, setCurrentPage] = useState(1);
  const [openExport, setOpenExport] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectData, setSelectData] = useState([]);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const exportRef = useRef(null);

  // ================= SELECT MERCHANT DATA =================
  useEffect(() => {
    const uniqueMerchants = new Map();
    data.forEach((item) => {
      if (item.user_id) {
        uniqueMerchants.set(item.user_id, {
          value: item.user_id,
          label: item.merchant_details || item.user_id,
        });
      }
    });
    setSelectData([...uniqueMerchants.values()]);
  }, [data]);

  // ================= CLOSE EXPORT ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setOpenExport(false);
      }
    };
    const handleScroll = () => setOpenExport(false);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  // ================= DELETE =================
  const modifiedEndpoint =
    endPoint && recordId ? `${endPoint}/${recordId}` : null;
  const { execute: deleteRecord } = usePost(modifiedEndpoint || "");

  const handleDelete = async () => {
    if (!recordId) return;
    try {
      await deleteRecord({});
      toast.success("Record deleted successfully!");
      setData?.((prev) => prev.filter((row) => row.id !== recordId));
      refreshTable?.();
      setShowConfirmModal(false);
      setRecordId(null);
    } catch {
      toast.error("Failed to delete record");
    }
  };

  // ================= FILTER DATA (search + status + merchant + date) =================
  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();

    // 🔹 rawData fallback for search matching
    const sourceForSearch = rawData.length ? rawData : data;

    // 1) SEARCH MATCH (returns ids)
    let matchedIds = null;
    if (q) {
      matchedIds = new Set(
        sourceForSearch
          .filter((item) =>
            Object.values(item).some((val) => {
              if (val == null) return false;
              if (typeof val === "object") return false; // skip JSX/objects
              return String(val).toLowerCase().includes(q);
            }),
          )
          .map((item) => item.id),
      );
    }

    // 2) Apply all filters on `data` (render data)
    return data.filter((row) => {
      // search
      if (matchedIds && !matchedIds.has(row.id)) return false;

      // status
      if (statusFilter !== "all") {
        const s = String(row.status ?? "").toLowerCase();
        if (s !== String(statusFilter).toLowerCase()) return false;
      }

      // merchant
      if (selectedMerchant?.value) {
        if (String(row.user_id) !== String(selectedMerchant.value))
          return false;
      }

      // date range (expects row.date OR row.created_at OR row.updated_at)
      if (startDate || endDate) {
        const raw =
          row.date ||
          row.created_at ||
          row.updated_at ||
          row.createdAt ||
          row.updatedAt;

        if (!raw) return false;

        const rowDate = new Date(raw);
        if (Number.isNaN(rowDate.getTime())) return false;

        if (startDate) {
          const s = new Date(startDate);
          s.setHours(0, 0, 0, 0);
          if (rowDate < s) return false;
        }

        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          if (rowDate > e) return false;
        }
      }

      return true;
    });
  }, [
    search,
    data,
    rawData,
    statusFilter,
    selectedMerchant,
    startDate,
    endDate,
  ]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedMerchant, startDate, endDate]);

  // ✅ total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredData.length / entriesPerPage);
  }, [filteredData.length, entriesPerPage]);

  // ✅ keep currentPage valid
  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(start, start + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  const totalSuccessAmount = useMemo(() => {
    return filteredData
      .filter((row) => String(row.status).toLowerCase() === "success")
      .reduce((sum, row) => sum + (row.numericAmount || 0), 0);
  }, [filteredData]);

  // ================= EXPORT HELPERS =================
  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // const exportCSV = () => {
  //   const headers = columns.map((c) => c.header).join(",");
  //   const rows = rawData
  //     .map((row) =>
  //       columns
  //         .map((c) => {
  //           const val = row[c.accessor];
  //           if (val === null || val === undefined) return "";
  //           if (typeof val === "object" || typeof val === "function") return "";
  //           return `"${String(val).replace(/"/g, '""')}"`;
  //         })
  //         .join(",")
  //     )
  //     .join("\n");
  //   downloadFile(`${headers}\n${rows}`, "table.csv", "text/csv");
  // };
  const exportCSV = () => {
    if (!rawData.length) return;

    let formattedExport = [];

    if (exportType === "upi") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          order_id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          payee_vpa: item.payee_vpa ?? "null",
          ref_no: item.refno ?? "null",
          payee_txnid: item.mytxnid ?? "null",
          txn_id: item.txnid ?? "null",
          amount: item.amount ?? 0,
          charges: item.charge ?? 0,
          gst: item.gst ?? 0,
          payin_rolling_amount: item.payin_rolling_amount ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "payout") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          order_id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          user_name: item.user?.name ?? "N/A",
          user_id: item.user_id ?? "N/A",

          payout_mode: item.payout_mode ?? "N/A",
          account_number: item.payer_acc_no ?? "N/A",
          account_holder: item.payer_name ?? "N/A",
          ifsc: item.payer_ifsc ?? "N/A",
          upi: item.payer_upi ?? "N/A",
          mobile: item.payer_mobile ?? "N/A",

          ref_no: item.refno ?? "N/A",
          order_reference: item.mytxnid ?? "N/A",
          txn_id: item.txnid ?? "N/A",

          opening_balance: item.payout_opening_balance ?? 0,
          pay_amount: item.amount ?? 0,
          charges: item.charge ?? 0,
          gst: item.gst ?? 0,
          total_debit: item.payout_amount ?? 0,
          closing_balance: item.payout_closing_balance ?? 0,
          note: item.description ?? "-",

          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "topup") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);

        return {
          id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          product_type: item.product ?? "N/A",
          txn_id: item.txnid ?? "N/A",
          amount: item.amount ?? 0,
          opening_balance: item.payout_opening_balance ?? 0,
          closing_balance: item.payout_closing_balance ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "payin_settlement") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);

        return {
          id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          product_type: item.product ?? "N/A",
          txn_id: item.txnid ?? "N/A",
          amount: item.amount ?? 0,
          opening_balance: item.payin_opening ?? 0,
          closing_balance: item.payin_closing ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "load_wallet") {
      formattedExport = rawData.map((item) => {
        return {
          user_id: item.id,
          name: item.name ?? "N/A",
          payout_wallet: item.payout_wallet ?? 0,
        };
      });
    }

    if (exportType === "payin_wallet") {
      formattedExport = rawData.map((item) => {
        return {
          user_id: item.id,
          name: item.name ?? "N/A",
          payin_wallet: item.payin_wallet ?? 0,
        };
      });
    }

    const headers = Object.keys(formattedExport[0]).join(",");

    const rows = formattedExport
      .map((row) =>
        Object.values(row)
          .map((val) => `="${String(val).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    downloadFile(
      `${headers}\n${rows}`,
      `${exportType}_statement.csv`,
      "text/csv",
    );
  };

  // const exportJSON = () => {
  //   const cleanData = rawData.map((row) => {
  //     const obj = {};
  //     columns.forEach((c) => {
  //       const val = row[c.accessor];
  //       if (typeof val !== "object" && typeof val !== "function") {
  //         obj[c.accessor] = val;
  //       }
  //     });
  //     return obj;
  //   });
  //   downloadFile(
  //     JSON.stringify(cleanData, null, 2),
  //     "table.json",
  //     "application/json",
  //   );
  // };

  const exportJSON = () => {
    if (!rawData.length) return;

    let formattedExport = [];

    if (exportType === "upi") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          order_id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          payee_vpa: item.payee_vpa ?? "null",
          ref_no: item.refno ?? "null",
          payee_txnid: item.mytxnid ?? "null",
          txn_id: item.txnid ?? "null",
          amount: item.amount ?? 0,
          charges: item.charge ?? 0,
          gst: item.gst ?? 0,
          payin_rolling_amount: item.payin_rolling_amount ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "payout") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          order_id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          user_name: item.user?.name ?? "N/A",
          user_id: item.user_id ?? "N/A",
          payout_mode: item.payout_mode ?? "N/A",
          account_number: item.payer_acc_no ?? "N/A",
          account_holder: item.payer_name ?? "N/A",
          ifsc: item.payer_ifsc ?? "N/A",
          upi: item.payer_upi ?? "N/A",
          mobile: item.payer_mobile ?? "N/A",
          ref_no: item.refno ?? "N/A",
          order_reference: item.mytxnid ?? "N/A",
          txn_id: item.txnid ?? "N/A",
          opening_balance: item.payout_opening_balance ?? 0,
          pay_amount: item.amount ?? 0,
          charges: item.profit ?? 0,
          total_debit: item.payout_amount ?? 0,
          closing_balance: item.payout_closing_balance ?? 0,
          note: item.description ?? "-",
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "topup") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          product_type: item.product ?? "N/A",
          txn_id: item.txnid ?? "N/A",
          amount: item.amount ?? 0,
          opening_balance: item.payout_opening_balance ?? 0,
          closing_balance: item.payout_closing_balance ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "payin_settlement") {
      formattedExport = rawData.map((item) => {
        const d = new Date(item.created_at);
        return {
          id: item.id,
          date: d.toLocaleDateString("en-GB"),
          time: d.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          merchant_name: item.user?.name ?? "N/A",
          merchant_id: item.user_id ?? "N/A",
          product_type: item.product ?? "N/A",
          txn_id: item.txnid ?? "N/A",
          amount: item.amount ?? 0,
          opening_balance: item.payin_opening ?? 0,
          closing_balance: item.payin_closing ?? 0,
          status: item.status ?? "N/A",
        };
      });
    }

    if (exportType === "load_wallet") {
      formattedExport = rawData.map((item) => ({
        user_id: item.id,
        name: item.name ?? "N/A",
        payout_wallet: item.payout_wallet ?? 0,
      }));
    }

    if (exportType === "payin_wallet") {
      formattedExport = rawData.map((item) => ({
        user_id: item.id,
        name: item.name ?? "N/A",
        payin_wallet: item.payin_wallet ?? 0,
      }));
    }

    downloadFile(
      JSON.stringify(formattedExport, null, 2),
      `${exportType}_statement.json`,
      "application/json",
    );
  };

  // const exportTXT = () => {
  //   const headers = columns.map((c) => c.header).join(" | ");
  //   const rows = rawData
  //     .map((row) =>
  //       columns
  //         .map((c) => {
  //           const val = row[c.accessor];
  //           if (val === null || val === undefined) return "";
  //           if (typeof val === "object" || typeof val === "function") return "";
  //           return String(val);
  //         })
  //         .join(" | "),
  //     )
  //     .join("\n");
  //   downloadFile(`${headers}\n${rows}`, "table.txt", "text/plain");
  // };

  // const exportSQL = () => {
  //   const tableName = "export_table";
  //   const sqlRows = rawData
  //     .map((row) => {
  //       const values = columns
  //         .map((c) => {
  //           const val = row[c.accessor];
  //           if (val === null || val === undefined) return "NULL";
  //           if (typeof val === "object" || typeof val === "function")
  //             return "NULL";
  //           if (typeof val === "number") return val;
  //           return `'${String(val).replace(/'/g, "''")}'`;
  //         })
  //         .join(", ");

  //       return `INSERT INTO ${tableName} (${columns
  //         .map((c) => c.accessor)
  //         .join(", ")}) VALUES (${values});`;
  //     })
  //     .join("\n");

  //   downloadFile(sqlRows, "table.sql", "text/sql");
  // };

  // ================= JSX =================
  return (
    <div className="w-full">
      {/* FILTER BAR */}
      {(showSearch ||
        showStatusFilter ||
        showExport ||
        showDateFilter ||
        showSelectUserFilter) && (
        <div className="w-full bg-gradient-to-br from-[#f1d9b7] via-[#f8e9d4] to-[#e6d5b8] border border-[#d7c4a8] rounded-2xl shadow-xl p-5 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            {/* LEFT FILTERS */}
            <div className="flex flex-wrap items-center gap-4">
              {showSearch && (
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[#9c8a78]"></i>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-56 pl-10 pr-3 py-2 bg-white border border-[#d7c4a8] rounded-xl shadow-sm text-[#4d443b] placeholder:text-[#b8a898] focus:ring-2 focus:ring-[#b58351]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              )}

              {showSelectUserFilter &&
                (role === "admin" ? (
                  <div className="w-56">
                    <CustomSelect
                      options={selectData}
                      placeholder="Select Merchant"
                      value={selectedMerchant}
                      onChange={setSelectedMerchant}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-[#9c8a78]"></i>
                    <input
                      type="text"
                      placeholder="Search ID"
                      className="w-56 pl-10 pr-3 py-2 bg-white border border-[#d7c4a8] rounded-xl shadow-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                ))}

              {showDateFilter && (
                <div className="flex items-center gap-2">
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    placeholderText="Start Date"
                    className="w-40 px-3 py-2 bg-white border border-[#d7c4a8] rounded-xl shadow-sm text-[#4d443b] focus:ring-2 focus:ring-[#b58351]"
                  />
                  <span className="text-[#9c8a78] font-semibold">—</span>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    placeholderText="End Date"
                    minDate={startDate}
                    className="w-40 px-3 py-2 bg-white border border-[#d7c4a8] rounded-xl shadow-sm text-[#4d443b] focus:ring-2 focus:ring-[#b58351]"
                  />
                </div>
              )}

              {showStatusFilter && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-[#d7c4a8] rounded-xl bg-white shadow-sm text-[#4d443b] focus:ring-2 focus:ring-[#b58351] cursor-pointer"
                >
                  <option value="all">All</option>
                  {statusList.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* RIGHT BUTTONS */}
            <div className="flex items-center gap-3 ml-auto">
              {showExport && (
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setOpenExport(!openExport)}
                    className="bg-gradient-to-r from-[#b58351] to-[#d7a874] text-white px-4 py-2 rounded-xl shadow-lg hover:brightness-110 flex items-center gap-2 min-w-[110px] h-[42px] cursor-pointer"
                  >
                    <i className="fa-solid fa-download"></i> Export
                  </button>

                  {openExport && (
                    <div className="absolute right-0 mt-2 bg-white border border-[#d7c4a8] rounded-xl shadow-xl p-2 w-40 z-30">
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={exportCSV}
                      >
                        CSV
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={exportJSON}
                      >
                        JSON
                      </button>
                      {/* <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={exportTXT}
                      >
                        TEXT
                      </button>
                      <button
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
                        onClick={exportSQL}
                      >
                        SQL
                      </button> */}
                    </div>
                  )}
                </div>
              )}

              <Button
                className="bg-[#f1d9b7] text-[#4d443b] px-4 py-2 rounded-xl shadow-md hover:bg-[#e9cdaa] transition min-w-[110px] h-[42px] cursor-pointer"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSelectedMerchant(null);
                  setStartDate(null);
                  setEndDate(null);
                  setCurrentPage(1);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>

          {showSelectUserFilter && (
            <div className="flex justify-end mt-3">
              <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-2 rounded-xl text-sm shadow-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-check"></i>
                Total Successful: ₹{totalSuccessAmount.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABLE ROWS */}
      <div className="w-full space-y-5">
        {paginatedData.length ? (
          paginatedData.map((row) => (
            <div
              key={row.id}
              className="bg-gradient-to-br from-white to-[#faf4ec] border border-[#e6ded4] rounded-2xl shadow-lg p-5 hover:shadow-xl hover:scale-[1.01] transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {columns.map((col, i) => (
                  <div key={i}>
                    <p className="text-xs text-[#9c8a78] font-semibold uppercase tracking-wide">
                      {col.header}
                    </p>
                    <p className="text-[#4d443b] text-sm mt-1">
                      {col.Cell
                        ? col.Cell({ value: row[col.accessor], row })
                        : row[col.accessor]}
                    </p>
                  </div>
                ))}
              </div>

              {showDeleteColumn && (
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => {
                      setRecordId(row.id);
                      setShowConfirmModal(true);
                    }}
                    className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-[#4d443b] py-6 bg-gradient-to-br from-white to-[#faf4ec] border border-[#e6ded4] rounded-2xl shadow-sm">
            No data found
          </div>
        )}
      </div>

      {/* ✅ FIXED PAGINATION */}
      {showPagination && totalPages > 0 && (
        <div className="flex flex-wrap justify-between items-center bg-gradient-to-br from-[#faf4ec] to-[#f8efe4] border border-[#e6ded4] rounded-2xl shadow-md px-4 py-3 mt-3 gap-3">
          {/* Show entries */}
          <div className="flex items-center gap-2 text-[#4d443b]">
            Show
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#d7c4a8] rounded-lg px-2 py-1 bg-white text-[#4d443b] shadow-sm cursor-pointer"
            >
              {[10, 50, 100, 150, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            entries
          </div>

          {/* Page controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white shadow hover:brightness-110"
                }`}
            >
              First
            </Button>

            <Button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white shadow hover:brightness-110"
                }`}
            >
              Prev
            </Button>

            <span className="px-4 py-1.5 rounded-xl bg-white border border-[#e6ded4] text-sm text-[#4d443b] shadow-sm">
              Page <b>{currentPage}</b> / {totalPages}
            </span>

            <Button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white shadow hover:brightness-110"
                }`}
            >
              Next
            </Button>

            <Button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f1d9b7] to-[#b58351] text-white shadow hover:brightness-110"
                }`}
            >
              Last
            </Button>
          </div>
        </div>
      )}

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
