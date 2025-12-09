import { useEffect, useRef, useState, useMemo } from "react";

export const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  // Prepare data safely, fallback 0 values if missing
  const chartData = useMemo(() => {
    // If data exists, map month names and totals
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        month_name: item.month_name || "Month",
        total: Number(item.total) || 0,
      }));
    }
    // Fallback for empty data: 12 months with 0 totals
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];
    return months.map((month) => ({ month_name: month, total: 0 }));
  }, [data]);

  const amount = chartData.map((item) => item.total);
  const months = chartData.map((item) => item.month_name);

  useEffect(() => {
    if (window.ApexCharts && chartRef.current) {
      const options = {
        chart: {
          height: "100%",
          maxWidth: "100%",
          type: "area",
          fontFamily: "Inter, sans-serif",
          dropShadow: { enabled: false },
          toolbar: { show: false },
          animations: { enabled: false },
        },
        tooltip: {
          enabled: true,
          x: { show: false },
        },
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.55,
            opacityTo: 0,
            shade: "#615141",
            gradientToColors: ["#615141"],
          },
        },
        dataLabels: { enabled: false },
        stroke: { width: 6 },
        grid: {
          show: false,
          strokeDashArray: 4,
          padding: { left: 2, right: 2, top: 0 },
        },
        series: [
          {
            name: "Transactions",
            data: amount,
            color: "#b58351",
          },
        ],
        xaxis: {
          categories: months,
          labels: { show: true },
          axisBorder: { show: true },
          axisTicks: { show: true },
        },
        yaxis: { show: true },
      };

      const chart = new window.ApexCharts(chartRef.current, options);
      chart.render();

      return () => chart.destroy();
    }
  }, [amount, months]);

  return (
    <div className="max-w-3xl w-full bg-white rounded-lg shadow-sm p-4 md:p-6 ">
      <div className="flex justify-between ">
        <div>
          <h5 className="leading-none text-3xl font-bold text-gray-900 pb-2">
            {amount.reduce((a, b) => a + b, 0)}
          </h5>
          <p className="text-base font-normal text-gray-500">
            Transactions this year
          </p>
        </div>
      </div>
      {/* Always render chart */}
      <div className="py-6" ref={chartRef}></div>
    </div>
  );
};
