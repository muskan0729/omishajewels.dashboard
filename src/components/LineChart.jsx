import { useEffect, useRef, useMemo } from "react";

export const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  // Normalize data
  const chartData = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((d) => Number(d.total) || 0);
    }

    return [1200, 600, 900, 1500, 1700, 1400, 2000, 800, 1900];
  }, [data]);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"];
  const total = chartData.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!window.ApexCharts || !chartRef.current) return;

    const options = {
      chart: {
        type: "area",
        height: 320,
        toolbar: { show: false },
      },

      series: [
        {
          name: "Amount",
          data: chartData,
        },
      ],

      stroke: {
        curve: "smooth",
        width: 3,
        colors: [""], // your theme color
      },



      dataLabels: {
        enabled: true,
        style: {
          colors: ["#C28E72"], // change BLUE number labels → your theme color
          fontSize: "12px",
          fontWeight: "bold",
        },
      },

      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: "#EDD5C4", opacity: 0.45 },
            { offset: 50, color: "#D7B59A", opacity: 0.30 },
            { offset: 100, color: "#C28E72", opacity: 0.20 },
          ],
        },
      },

      tooltip: {
        theme: "light",
        marker: {
          fillColors: ["#C28E72"], // tooltip blue → theme color
        },
        y: {
          formatter: (val) => `₹${val}`,
        },
      },

      xaxis: {
        categories: months,
        labels: {
          style: { fontSize: "13px", colors: "#7A6A58" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        labels: { style: { colors: "#7A6A58" } },
      },

      grid: {
        borderColor: "#e7e1db",
        strokeDashArray: 4,
      },
    };

    const chart = new window.ApexCharts(chartRef.current, options);
    chart.render();

    return () => chart.destroy();
  }, [chartData]);

  return (
    <div className="w-full bg-white rounded-2xl shadow p-6">
      <h1 className="text-4xl font-bold text-gray-900">₹{total}</h1>


      <div ref={chartRef}></div>
    </div>
  );
};
