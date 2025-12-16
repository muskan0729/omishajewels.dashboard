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

  // Initialize modal state
  useEffect(() => {
    if (showModal) {
      if (editData) {
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
        await createScheme(payload);
        toast.success("Scheme created successfully!");
      }
      refreshTable();
      handleModal();
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  if (!showModal) return null;

  return (
    <>
      {/* Background Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />

      {/* Modal Box */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl">

        <div className="bg-white shadow-2xl rounded-xl overflow-hidden border border-[#e8d5b5]">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#f3d9a3] to-[#d7a248] text-[#5a3e1b] px-6 py-4 flex justify-between items-center shadow-md">
            <h3 className="text-lg font-semibold tracking-wide">
              {editData ? "Edit Scheme" : "Add New Scheme"}
            </h3>

            <button
              onClick={handleModal}
              className="bg-white text-red-600 w-8 h-8 rounded-full flex items-center justify-center shadow hover:bg-red-500 hover:text-white transition"
            >
              ✕
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-b from-white to-[#faf6ef]">

            {/* Scheme Name */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium text-[#8d6c3c]">
                Scheme Name
              </label>
              <input
                type="text"
                className="w-full border border-[#d5c3a3] rounded-lg p-2 text-sm shadow-sm focus:ring-[#c79a3b] focus:border-[#c79a3b]"
                placeholder="Enter Scheme Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-[#d5c3a3] mb-5">
              <ul className="flex gap-1 text-sm font-medium">

                {[
                  { id: "tab1", name: "Payin", icon: "fa-money-bill-transfer" },
                  { id: "tab2", name: "Payout", icon: "fa-credit-card" },
                  { id: "tab3", name: "Rolling Amount", icon: "fa-rotate" },
                  { id: "tab4", name: "GST", icon: "fa-percent" },
                ].map((tab) => (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-t-lg transition-all flex items-center gap-2 
                        ${
                          activeTab === tab.id
                            ? "bg-[#c59b42] text-white shadow"
                            : "text-[#8d6c3c] hover:text-[#c59b42]"
                        }`}
                    >
                      <i className={`fa-solid ${tab.icon}`}></i>
                      {tab.name}
                    </button>
                  </li>
                ))}

              </ul>
            </div>

            {/* Table Section */}
        <div className="bg-white rounded-lg border border-[#e8d5b5] shadow-lg overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-gradient-to-r from-[#f3d9a3] to-[#e6b35a] text-[#704f21]">
      <tr>
        <th className="px-5 py-3 text-left">Operator</th>
        <th className="px-5 py-3 text-left">Type</th>
        <th className="px-5 py-3 text-left">Amount</th>
      </tr>
    </thead>

    <tbody className="divide-y divide-[#e6decf]">

      {/* TAB 1 */}
      {activeTab === "tab1" && (
        <tr>
          <td className="px-5 py-4 font-semibold">Payin Commission</td>

          {/* SELECT */}
          <td className="px-5 py-4">
            <select
              value={payin.type}
              onChange={(e) => setPayin({ ...payin, type: e.target.value })}
              className="
                w-full px-3 py-2 
                rounded-lg 
                border border-[#d5c3a3] 
                bg-white 
                shadow-sm 
                text-gray-700 
                focus:outline-none 
                focus:ring-2 
                focus:ring-[#d6a55d] 
                focus:border-[#b3843d] 
                transition-all
              "
            >
              <option value="flat">Flat</option>
              <option value="percent">Percent</option>
            </select>
          </td>

          {/* INPUT */}
          <td className="px-5 py-4">
            <input
              type="number"
              value={payin.amount}
              onChange={(e) => setPayin({ ...payin, amount: e.target.value })}
              className="
                w-full px-3 py-2 
                rounded-lg
                border border-[#d5c3a3] 
                bg-white 
                shadow-sm 
                text-gray-700 
                focus:outline-none 
                focus:ring-2 
                focus:ring-[#d6a55d] 
                focus:border-[#b3843d] 
                transition-all
              "
            />
          </td>
        </tr>
      )}

      {/* TAB 2 */}
      {activeTab === "tab2" && (
        <>
          <tr>
            <td className="px-5 py-4 font-semibold">Payout Below 700</td>
            <td className="px-5 py-4">
              <select
                value={payout.below700.type}
                onChange={(e) =>
                  setPayout({
                    ...payout,
                    below700: { ...payout.below700, type: e.target.value },
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white 
                  shadow-sm 
                  text-gray-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-[#d6a55d] 
                  focus:border-[#b3843d] 
                  transition-all
                "
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </td>

            <td className="px-5 py-4">
              <input
                type="number"
                value={payout.below700.amount}
                onChange={(e) =>
                  setPayout({
                    ...payout,
                    below700: { ...payout.below700, amount: e.target.value },
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white 
                  shadow-sm 
                  text-gray-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-[#d6a55d] 
                  focus:border-[#b3843d] 
                  transition-all
                "
              />
            </td>
          </tr>

          <tr className="bg-[#fff6dd]">
            <td className="px-5 py-4 font-semibold">Payout Above 700</td>

            <td className="px-5 py-4">
              <select
                value={payout.above700.type}
                onChange={(e) =>
                  setPayout({
                    ...payout,
                    above700: { ...payout.above700, type: e.target.value },
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white 
                  shadow-sm 
                  text-gray-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-[#d6a55d] 
                  focus:border-[#b3843d] 
                  transition-all
                "
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </td>

            <td className="px-5 py-4">
              <input
                type="number"
                value={payout.above700.amount}
                onChange={(e) =>
                  setPayout({
                    ...payout,
                    above700: { ...payout.above700, amount: e.target.value },
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white 
                  shadow-sm 
                  text-gray-700 
                  focus:outline-none 
                  focus:ring-2 
                  focus:ring-[#d6a55d] 
                  focus:border-[#b3843d] 
                  transition-all
                "
              />
            </td>
          </tr>
        </>
      )}

      {/* TAB 3 – Rolling Amount */}
      {activeTab === "tab3" && (
        <>
          {/* PAYIN */}
          <tr>
            <td className="px-5 py-4 font-semibold">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rollingOption"
                  checked={selectedRolling === "payin"}
                  onChange={() => setSelectedRolling("payin")}
                />
                Rolling Payin Amount
              </label>
            </td>

            <td className="px-5 py-4">
              <select
                disabled={selectedRolling !== "payin"}
                value={rollingPayin.type}
                onChange={(e) =>
                  setRollingPayin({ ...rollingPayin, type: e.target.value })
                }
                className="
                  w-full px-3 py-2 rounded-lg
                  border border-[#d5c3a3] bg-white 
                  shadow-sm text-gray-700 
                  disabled:bg-gray-200 
                  focus:ring-2 focus:ring-[#d6a55d] 
                  focus:border-[#b3843d]
                  transition-all
                "
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </td>

            <td className="px-5 py-4">
              <input
                disabled={selectedRolling !== "payin"}
                type="number"
                value={selectedRolling === "payin" ? rollingPayin.amountStr : ""}
                onChange={(e) =>
                  setRollingPayin({
                    ...rollingPayin,
                    amountStr: e.target.value,
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white shadow-sm 
                  text-gray-700 disabled:bg-gray-200 
                  focus:ring-2 focus:ring-[#d6a55d] 
                  focus:border-[#b3843d]
                  transition-all
                "
              />
            </td>
          </tr>

          {/* FIXED */}
          <tr>
            <td className="px-5 py-4 font-semibold">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rollingOption"
                  checked={selectedRolling === "fixed"}
                  onChange={() => setSelectedRolling("fixed")}
                />
                Rolling Fixed Amount
              </label>
            </td>

            <td className="px-5 py-4">
              <select
                disabled={selectedRolling !== "fixed"}
                value={rollingFixed.type}
                onChange={(e) =>
                  setRollingFixed({ ...rollingFixed, type: e.target.value })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3] 
                  bg-white 
                  shadow-sm 
                  text-gray-700 
                  disabled:bg-gray-200
                  focus:ring-2 focus:ring-[#d6a55d]
                  focus:border-[#b3843d]
                  transition-all
                "
              >
                <option value="flat">Flat</option>
                <option value="percent">Percent</option>
              </select>
            </td>

            <td className="px-5 py-4">
              <input
                disabled={selectedRolling !== "fixed"}
                type="number"
                value={selectedRolling === "fixed" ? rollingFixed.amountStr : ""}
                onChange={(e) =>
                  setRollingFixed({
                    ...rollingFixed,
                    amountStr: e.target.value,
                  })
                }
                className="
                  w-full px-3 py-2 
                  rounded-lg 
                  border border-[#d5c3a3]
                  bg-white shadow-sm
                  text-gray-700 
                  disabled:bg-gray-200
                  focus:ring-2 focus:ring-[#d6a55d]
                  focus:border-[#b3843d]
                  transition-all
                "
              />
            </td>
          </tr>
        </>
      )}

      {/* TAB 4 – GST */}
      {activeTab === "tab4" && (
        <tr>
          <td className="px-5 py-4 font-semibold">GST (%)</td>
          <td className="px-5 py-4">
            <select disabled className="
              w-full px-3 py-2 rounded-lg
              border border-[#d5c3a3] bg-gray-200 
            ">
              <option value="percent">Percent</option>
            </select>
          </td>
          <td className="px-5 py-4">
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="
                w-full px-3 py-2 
                rounded-lg 
                border border-[#d5c3a3]
                bg-white shadow-sm
                text-gray-700 
                focus:ring-2 focus:ring-[#d6a55d]
                focus:border-[#b3843d]
                transition-all
              "
            />
          </td>
        </tr>
      )}

    </tbody>
  </table>
</div>


            {/* Submit */}
            <div className="mt-6 flex justify-end">
              <Button
                disabled={creating || updating}
                className="px-6 py-2 rounded-lg bg-[#c59b42] text-white hover:bg-[#a57d2a] shadow-md transition"
              >
                {editData ? "Update Scheme" : "Create Scheme"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
};
       