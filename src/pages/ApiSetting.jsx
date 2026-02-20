import React, { useEffect, useState } from "react";
import { usePost } from "../hooks/usePost";
import { useGet } from "../hooks/useGet";
import Table from "../components/Table";
import { useToast } from "../contexts/ToastContext";
import { MONTH_NAMES } from "../constants/Constants";

const ApiSetting = () => {
  const Toast = useToast();

  const [activeTab, setActiveTab] = useState("apiToken");
  const [apiToken, setApiToken] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // IP modal
  const [showIpModal, setShowIpModal] = useState(false);
  const [ipAddress, setIpAddress] = useState("");

  // Webhooks
  const [PayinWebHook, setPayinWebHook] = useState("");
  const [PayoutWebhook, setPayoutWebHook] = useState("");

  const { execute } = usePost("/generate-token");
  const endPoint = activeTab === "apiToken" ? "/get-tokens" : "";
  const { data: apiTokensData, refetch: refetchApiTokens } = useGet(endPoint);

  /* ================= FORMAT TOKEN DATA (SAFE WRAP) ================= */
  useEffect(() => {
    const formatted =
      apiTokensData?.data?.map((item, index) => ({
        sqno: index + 1,
        id: item.id,
        ip: item.ip,

        token: (
          <div className="flex items-start gap-2 max-w-[360px]">
            <div className="break-all whitespace-normal leading-relaxed font-mono text-sm">
              {item.token}
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(item.token);
                Toast.success("Token copied");
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
              title="Copy token"
            >
              <i className="fa-regular fa-copy text-sm"></i>
            </button>
          </div>
        ),

        date:
          new Date(item.created_at).getDate() +
          " " +
          MONTH_NAMES[new Date(item.created_at).getMonth()] +
          " " +
          new Date(item.created_at).getFullYear(),
      })) || [];

    setApiToken(formatted);
  }, [apiTokensData]);

  /* ================= TABLE COLUMNS (SIMPLE & SAFE) ================= */
  const tokenTableColumns = [
    { header: "SQNo", accessor: "sqno" },
    { header: "IP", accessor: "ip" },
    { header: "Token", accessor: "token" },
    { header: "Date", accessor: "date" },
  ];

  /* ================= IP VALIDATION ================= */
  const isValidIP = (ip) => {
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::1)$/;
    return ipv4.test(ip) || ipv6.test(ip);
  };

  /* ================= GENERATE TOKEN ================= */
  const handleGenerateToken = async () => {
    if (!ipAddress.trim()) {
      Toast.error("Please enter IP address");
      return;
    }

    if (!isValidIP(ipAddress)) {
      Toast.error("Please enter a valid IP address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await execute({ ip: ipAddress });

      if (res?.message === "Auth token generated successfully") {
        Toast.success("Token Generated Successfully");
        refetchApiTokens();
        setShowIpModal(false);
        setIpAddress("");
      }
    } catch {
      Toast.error("Failed to generate token");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= WEBHOOK DATA ================= */
  const { data: WebhookUrl, loading: WebHookLoading } =
    useGet("/show-merchant");

  useEffect(() => {
    if (WebhookUrl?.data) {
      setPayinWebHook(WebhookUrl.data.payin_callback || "");
      setPayoutWebHook(WebhookUrl.data.payout_callback || "");
    }
  }, [WebhookUrl]);

  const { execute: updateWebhook } = usePost("/update-merchant");

  const handleSaveWebhook = async () => {
    try {
      const res = await updateWebhook({
        payin_callback: PayinWebHook,
        payout_callback: PayoutWebhook,
      });

      if (res?.message === "Merchant updated successfully") {
        Toast.success("Webhook updated successfully!");
      }
    } catch {
      Toast.error("Failed to update webhook!");
    }
  };

  return (
    <div className="p-6 mx-auto">
      {/* ================= IP MODAL ================= */}
      {showIpModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Generate New Token</h3>
              <button onClick={() => setShowIpModal(false)}>✕</button>
            </div>

            <input
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full border rounded px-3 py-2"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowIpModal(false)}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateToken}
                disabled={isLoading}
                className="bg-[#B68C64] border border-[#b5895c] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-[#ebaa69] hover:border-[#b5895c] transition-all duration-200 cursor-pointer"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TABS ================= */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("apiToken")}
          className={`px-4 py-2 ${
            activeTab === "apiToken"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          API Tokens
        </button>

        <button
          onClick={() => setActiveTab("webhookConfig")}
          className={`px-4 py-2 ${
            activeTab === "webhookConfig"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Webhooks
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      {activeTab === "apiToken" && (
        <div>
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold">Manage API Tokens</h2>
            <button
              onClick={() => setShowIpModal(true)}
              className="bg-[#B68C64] border border-[#b5895c] text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-[#ebaa69] hover:border-[#b5895c] transition-all duration-200 cursor-pointer"
            >
              Generate Token
            </button>
          </div>

          <Table
            columns={tokenTableColumns}
            data={apiToken}
            endPoint="/delete-token"
            refreshTable={refetchApiTokens}
            showStatusFilter={false}
            showExport={false}
            setData={setApiToken}
            showDateFilter={false}
          />
        </div>
      )}

      {activeTab === "webhookConfig" && (
        <div>
          <h2 className="font-semibold mb-3">Webhook Configuration</h2>

          <input
            className="w-full border rounded px-3 py-2 mb-3"
            value={PayinWebHook}
            onChange={(e) => setPayinWebHook(e.target.value)}
            placeholder="Payin Webhook URL"
          />

          <input
            className="w-full border rounded px-3 py-2"
            value={PayoutWebhook}
            onChange={(e) => setPayoutWebHook(e.target.value)}
            placeholder="Payout Webhook URL"
          />

          <button
            onClick={handleSaveWebhook}
            disabled={WebHookLoading}
            className="mt-4 w-full bg-indigo-600 text-white py-2 rounded"
          >
            Save Webhooks
          </button>
        </div>
      )}
    </div>
  );
};

export default ApiSetting;
