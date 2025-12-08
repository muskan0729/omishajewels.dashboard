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

    // Destroy previous chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const seriesData = total > 0 ? [pending, success, failed] : [0, 0, 0];

    const options = {
      series: seriesData,
      colors: ["#FBBC05", "#34A853", "#EA4335"],
      chart: {
        height: 320,
        width: "100%",
        type: "donut",
        animations: { enabled: false },
      },
      stroke: { colors: ["transparent"] },
      plotOptions: {
        pie: {
          donut: {
            size: "80%",
            labels: {
              show: true,
              name: { show: true, offsetY: 20 },
              total: {
                showAlways: true,
                show: true,
                label: "Transactions",
                formatter: () => total,
              },
              value: { show: true, offsetY: -20 },
            },
          },
        },
      },
      labels: ["Pending", "Success", "Failed"],
      dataLabels: { enabled: false },
      legend: { position: "bottom" },
    };

    // eslint-disable-next-line no-undef
    chartInstance.current = new ApexCharts(chartRef.current, options);
    chartInstance.current.render();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [pending, success, failed, total]);

  return (
    <div className="max-w-sm w-full bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="mb-3">
        <h5 className="text-xl font-bold leading-none text-gray-900 pe-1">
          Transactions
        </h5>
      </div>

      <div className="py-6" ref={chartRef}></div>
    </div>
  );
};
