import React, { useEffect, useRef, useState } from "react";

export const DonutChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 🔁 Toggle between modes
  const [mode, setMode] = useState("UPI");

  // 🔥 API-proof logic (IMPORTANT)
  const getChartData = () => {
    const transactionData = data?.[mode] || {};

    const pending =
      "pending" in transactionData ? Number(transactionData.pending) || 0 : 0;

    const success = Number(transactionData.success) || 0;
    const failed = Number(transactionData.failed) || 0;

    const series = [];
    const labels = [];
    const colors = [];

    if (pending > 0) {
      series.push(pending);
      labels.push("Pending");
      colors.push("#ddbea9");
    }

    if (success > 0) {
      series.push(success);
      labels.push("Success");
      colors.push("#cb997e");
    }

    if (failed > 0) {
      series.push(failed);
      labels.push("Failed");
      colors.push("#f3d8c7");
    }

    const total = pending + success + failed;
    const isEmpty = series.length === 0;

    return { series, labels, colors, total, isEmpty };
  };

  const { series, labels, colors, total, isEmpty } = getChartData();

  useEffect(() => {
    if (!chartRef.current || typeof ApexCharts === "undefined") return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const options = {
      series: isEmpty ? [1] : series,
      labels: isEmpty ? ["No Transactions"] : labels,
      colors: isEmpty ? ["#e5e7eb"] : colors,

      chart: {
        height: 340,
        type: "donut",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 900,
        },
      },

      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: {
                show: !isEmpty,
                fontSize: "16px",
                offsetY: 20,
              },
              value: {
                show: !isEmpty,
                fontSize: "28px",
                fontWeight: 700,
                offsetY: -10,
              },
              total: {
                show: true,
                label: isEmpty ? "No Transactions" : "Total",
                fontSize: "14px",
                formatter: () => (isEmpty ? 0 : total),
              },
            },
          },
        },
      },

      dataLabels: { enabled: false },

      legend: {
        position: "bottom",
        formatter: function (seriesName, opts) {
          if (isEmpty) return seriesName;
          const value = opts.w.globals.series[opts.seriesIndex];
          return `
            <div style="display:flex; flex-direction:column; align-items:center; line-height:16px">
              <div style="font-size:18px; font-weight:600; color:#111">${value}</div>
              <div style="font-size:12px; color:#777">${seriesName}</div>
            </div>
          `;
        },
      },

      tooltip: {
        enabled: !isEmpty,
        y: {
          formatter: (val) => `${val} transactions`,
        },
      },
    };

    // eslint-disable-next-line no-undef
    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    return () => chartInstance.current?.destroy();
  }, [mode, JSON.stringify(series)]);

  return (
    <div
      className="border border-orange-200 max-w-sm w-full bg-white rounded-xl
                  shadow-md p-4 overflow-hidden
                  transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex justify-between items-center">
        <div>
          <h5 className="text-xl font-semibold text-gray-800">Transactions</h5>
          <p className="text-sm text-gray-500">Overview breakdown</p>
        </div>

        <button
          onClick={() => setMode(mode === "UPI" ? "payout" : "UPI")}
          className="px-3 py-1 rounded-lg text-white text-sm font-semibold cursor-pointer"
          style={{ background: "linear-gradient(0deg, #cb997eff, #cb997eff)" }}
        >
          {mode === "UPI" ? "Payin" : "Payout"}
        </button>
      </div>

      <div className="py-6 overflow-hidden" ref={chartRef}></div>
    </div>
  );
};
