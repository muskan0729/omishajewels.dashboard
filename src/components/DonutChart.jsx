import React, { useEffect, useRef } from "react";

export const DonutChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const pending = Number(data?.pending) || 0;
  const success = Number(data?.success) || 0;
  const failed = Number(data?.failed) || 0;
  const total = pending + success + failed;

  useEffect(() => {
    if (!chartRef.current || typeof ApexCharts === "undefined") return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const seriesData = total > 0 ? [pending, success, failed] : [0, 0, 0];

    const options = {
      series: seriesData,
      colors: ["#ddbea9", "#cb997e", "#f3d8c7"],

      chart: {
        height: 340,
        type: "donut",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 900,
          animateGradually: { enabled: true, delay: 120 },
          dynamicAnimation: { enabled: true, speed: 500 },
        },
      },

      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "16px",
                offsetY: 20,
                color: "#555",
              },
              value: {
                show: true,
                fontSize: "28px",
                fontWeight: 700,
                offsetY: -10,
                color: "#111",
                formatter: (val) => val,
              },
              total: {
                show: true,
                label: "Total",
                color: "#888",
                fontSize: "14px",
                formatter: () => total,
              },
            },
          },
          expandOnClick: true,
        },
      },

      stroke: {
        colors: ["#fff"],
        width: 2,
      },

      labels: ["Pending", "Success", "Failed"],

      dataLabels: { enabled: false },

      legend: {
        position: "bottom",
        fontSize: "12px",
        horizontalAlign: "",
        markers: { width: 10, height: 10, radius: 10 },
        itemMargin: { horizontal: 6 },
        formatter: function (seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          return `
            <div style="
              display:flex;
              flex-direction:column;
              align-items:center;
              line-height:16px;
            ">
              <div style="font-size:18px; font-weight:600; color:#111;">${value}</div>
              <div style="font-size:12px; color:#777;">${seriesName}</div>
            </div>
          `;
        }
      },

      tooltip: {
        theme: "light",
        y: {
          formatter: (value) => `${value} transactions`,
        },
      },

      states: {
        hover: {
          filter: { type: "darken", value: 0.8 },
        },
        active: {
          filter: { type: "none" },
        },
      },
    };

    // eslint-disable-next-line no-undef
    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    return () => chartInstance.current?.destroy();
  }, [pending, success, failed, total]);

  return (
    <div className="border border-orange-200 max-w-sm w-full bg-white rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg">
      <h5 className="text-xl font-semibold text-gray-800">Transactions</h5>
      <p className="text-sm text-gray-500">Overview breakdown</p>

      <div className="py-6" ref={chartRef}></div>
    </div>
  );
};
