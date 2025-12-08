import { useEffect, useState } from "react";
import Button from "./Button";
import { usePost } from "../hooks/usePost";
import { useToast } from "../contexts/ToastContext";

export const SchemeModal = ({
  showModal,
  handleModal,
  editData,
  refreshTable,
}) => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("tab1");
  const [percentage, setPercentage] = useState(18);
  const [name, setName] = useState("");
  const [payin, setPayin] = useState({ type: "percent", amount: 0 });
  const [payout, setPayout] = useState({
    below700: { type: "flat", amount: 0 },
    above700: { type: "percent", amount: 0 },
  });
  const [rollingPayin, setRollingPayin] = useState({
    type: "percent",
    amount: 0,
    amountStr: "0",
  });
  const [rollingFixed, setRollingFixed] = useState({
    type: "flat",
    amount: 0,
    amountStr: "0",
  });
  const [selectedRolling, setSelectedRolling] = useState("payin");

  const { execute: createScheme, loading: creating } =
    usePost("/create-scheme");
  const { execute: updateScheme, loading: updating } = usePost(
    editData ? `/update-scheme/${editData.id}` : ""
  );

  // Initialize modal state when it opens
  useEffect(() => {
    if (showModal) {
      if (editData) {
        // Pre-fill with edit data
        setName(editData.name || "");
        setPayin({
          type: editData.payin_commision_type,
          amount: editData.payin_commision_amount,
        });
        setPayout({
          below700: {
            type: editData.payout_commision_type_below,
            amount: editData.payout_commision_amount_below,
          },
          above700: {
            type: editData.payout_commision_type_above,
            amount: editData.payout_commision_amount_above,
          },
        });
        setRollingPayin({
          type: editData.rolling_payin_type || "percent",
          amount: editData.rolling_payin_amount || 0,
          amountStr: String(editData.rolling_payin_amount || 0),
        });
        setRollingFixed({
          type: editData.rolling_fixed_type || "percent",
          amount: editData.rolling_fixed_amount || 0,
          amountStr: String(editData.rolling_fixed_amount || 0),
        });
        setSelectedRolling(
          editData.rolling_payin_amount > 0 ? "payin" : "fixed"
        );
        setPercentage(editData.gst_amount || 18);
      } else {
        // Reset for adding new scheme
        setName("");
        setPayin({ type: "percent", amount: 0 });
        setPayout({
          below700: { type: "flat", amount: 0 },
          above700: { type: "percent", amount: 0 },
        });
        setRollingPayin({ type: "percent", amount: 0, amountStr: "0" });
        setRollingFixed({ type: "percent", amount: 0, amountStr: "0" });
        setSelectedRolling("payin");
        setPercentage(18);
      }
    }
  }, [showModal, editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      toast.info("Please enter scheme name");
      return;
    }

    const payload = {
      name: name,
      payin_commision_type: payin.type,
      payin_commision_amount: parseFloat(payin.amount) || 0,
      payout_commision_type_below: payout.below700.type,
      payout_commision_amount_below: parseFloat(payout.below700.amount) || 0,
      payout_commision_type_above: payout.above700.type,
      payout_commision_amount_above: parseFloat(payout.above700.amount) || 0,
      rolling_payin_amount:
        selectedRolling === "payin"
          ? parseFloat(rollingPayin.amountStr) || 0
          : 0,
      rolling_payin_type:
        selectedRolling === "payin" ? rollingPayin.type : null,
      rolling_fixed_amount:
        selectedRolling === "fixed"
          ? parseFloat(rollingFixed.amountStr) || 0
          : 0,
      rolling_fixed_type:
        selectedRolling === "fixed" ? rollingFixed.type : null,
      gst_amount: parseFloat(percentage) || 18,
      gst_type: "percent",
    };

    try {
      if (editData) {
        await updateScheme(payload);
        toast.success("Scheme updated successfully!");
      } else {
        console.log("Payload of Scheme: ", payload);
        await createScheme(payload);
        toast.success("Scheme created successfully!");
      }
      refreshTable();
      handleModal();
    } catch (err) {
      console.error("Error saving scheme:", err);
      toast.error(err.message || "Something went wrong");
    }
  };

  if (!showModal) return null;

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
        // onClick={handleModal}
      ></div>

      <div
        className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 bg-white border rounded-lg w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-medium rounded-t-lg px-5 py-3 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {editData ? "Edit Scheme" : "Add New Scheme"}
          </h3>
          <Button
            onClick={handleModal}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-red-500 font-bold text-lg shadow-md hover:bg-red-500 hover:text-white transition"
          >
            <i className="fa-solid fa-xmark fa-lg"></i>
          </Button>
        </div>

        <form className="p-5" onSubmit={handleSubmit}>
          {/* Scheme Name */}
          <div className="mb-5">
            <label className="block mb-1 text-sm font-medium">
              Scheme Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Scheme Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
            />
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-2">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              {["tab1", "tab2", "tab3", "tab4"].map((tab, idx) => {
                const tabInfo = ["Payin", "Payout", "Rolling Amount", "GST"];
                const icons = [
                  "fa-money-bill-transfer",
                  "fa-credit-card",
                  "fa-rotate",
                  "fa-percent",
                ];
                return (
                  <li
                    key={tab}
                    className={`me-2 hover:text-blue-900 ${
                      activeTab === tab ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    <Button
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className="inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:border-blue-900 group"
                    >
                      <i className={`fa-solid ${icons[idx]} me-2`}></i>
                      {tabInfo[idx]}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Table */}
          <div className="relative">
            <table className="text-sm text-left text-gray-500 w-full">
              <thead className="text-md text-white uppercase bg-gradient-to-r from-blue-400 to-blue-700">
                <tr>
                  <th className="px-6 py-3">Operator</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Amount/Percentage</th>
                </tr>
              </thead>
              <tbody>
                {/* Payin */}
                {activeTab === "tab1" && (
                  <tr className="border-b border-gray-500">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Payin Commission Slab
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={payin.type}
                        onChange={(e) =>
                          setPayin({ ...payin, type: e.target.value })
                        }
                      >
                        <option value="flat">Flat</option>
                        <option value="percent">Percent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={payin.amount}
                        onChange={(e) =>
                          setPayin({ ...payin, amount: e.target.value })
                        }
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </td>
                  </tr>
                )}

                {/* Payout */}
                {activeTab === "tab2" && (
                  <>
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Payout Below 700
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={payout.below700.type}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              below700: {
                                ...payout.below700,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={payout.below700.amount}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              below700: {
                                ...payout.below700,
                                amount: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>

                    <tr className="border-b border-gray-500 bg-blue-100">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        Payout Above 700
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={payout.above700.type}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              above700: {
                                ...payout.above700,
                                type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={payout.above700.amount}
                          onChange={(e) =>
                            setPayout({
                              ...payout,
                              above700: {
                                ...payout.above700,
                                amount: e.target.value,
                              },
                            })
                          }
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>
                  </>
                )}

                {/* Rolling */}
                {activeTab === "tab3" && (
                  <>
                    {/* Rolling Payin */}
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rollingOption"
                            value="payin"
                            checked={selectedRolling === "payin"}
                            onChange={() => setSelectedRolling("payin")}
                          />
                          <span>Rolling Payin Amount</span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={rollingPayin.type}
                          onChange={(e) =>
                            setRollingPayin((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          disabled={selectedRolling !== "payin"}
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={
                            selectedRolling === "payin"
                              ? rollingPayin.amountStr
                              : ""
                          }
                          onChange={(e) =>
                            setRollingPayin((prev) => ({
                              ...prev,
                              amountStr: e.target.value,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          disabled={selectedRolling !== "payin"}
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>

                    {/* Rolling Fixed */}
                    <tr className="border-b border-gray-500">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="rollingOption"
                            value="fixed"
                            checked={selectedRolling === "fixed"}
                            onChange={() => setSelectedRolling("fixed")}
                          />
                          <span>Rolling Fixed Amount</span>
                        </label>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={rollingFixed.type}
                          onChange={(e) =>
                            setRollingFixed((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          disabled={selectedRolling !== "fixed"}
                        >
                          <option value="flat">Flat</option>
                          <option value="percent">Percent</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          value={
                            selectedRolling === "fixed"
                              ? rollingFixed.amountStr
                              : ""
                          }
                          onChange={(e) =>
                            setRollingFixed((prev) => ({
                              ...prev,
                              amountStr: e.target.value,
                              amount: parseFloat(e.target.value) || 0,
                            }))
                          }
                          disabled={selectedRolling !== "fixed"}
                          className="w-full border rounded-lg p-2 text-sm"
                        />
                      </td>
                    </tr>
                  </>
                )}

                {/* GST */}
                {activeTab === "tab4" && (
                  <tr className="border-b border-gray-500">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Goods and Service Tax
                    </td>
                    <td className="px-6 py-4">
                      <select value="percent" disabled>
                        <option value="percent">Percent</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="w-full border rounded-lg p-2 text-sm"
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-right">
            <Button
              type="submit"
              disabled={creating || updating}
              className="cursor-pointer text-white bg-[#615141] hover:bg-blue-700 px-5 py-2 rounded-lg"
            >
              {editData ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
