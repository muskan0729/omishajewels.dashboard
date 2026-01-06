import { useEffect, useRef, useMemo } from "react";

export const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  // ✅ NORMALIZE DATA (exactly like first correct code)
  const chartData = useMemo(() => {
    // API data exists
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        month_name: item.month_name || "Month",
        total:
          (Number(item.payin_amount) || 0) +
          (Number(item.payout_amount) || 0),
      }));
    }

    // fallback → EMPTY but SAFE (NO FAKE DATA)
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    return months.map((m) => ({
      month_name: m,
      total: 0,
    }));
  }, [data]);

  const amounts = chartData.map((d) => d.total);
  const months = chartData.map((d) => d.month_name);

  const totalAmount = amounts.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!window.ApexCharts || !chartRef.current) return;

    // const options = {
    //   chart: {
    //     type: "area",
    //     height: 320,
    //     toolbar: { show: false },
    //   },

    //   series: [
    //     {
    //       name: "Total Transactions",
    //       data: amounts,
    //     },
    //   ],

    //   stroke: {
    //     curve: "smooth",
    //     width: 3,
    //     colors: ["#C28E72"],
    //   },

    //   dataLabels: {
    //     enabled: true,
    //     style: {
    //       colors: ["#C28E72"],
    //       fontSize: "12px",
    //       fontWeight: "bold",
    //     },
    //   },

    //   fill: {
    //     type: "gradient",
    //     gradient: {
    //       opacityFrom: 0.45,
    //       opacityTo: 0,
    //       colorStops: [
    //         { offset: 0, color: "#EDD5C4", opacity: 0.45 },
    //         { offset: 50, color: "#D7B59A", opacity: 0.3 },
    //         { offset: 100, color: "#C28E72", opacity: 0.2 },
    //       ],
    //     },
    //   },

    //   tooltip: {
    //     theme: "light",
    //     y: {
    //       formatter: (val) => `₹${val}`,
    //     },
    //   },

    //   xaxis: {
    //     categories: months,
    //     labels: {
    //       style: { fontSize: "13px", colors: "#7A6A58" },
    //     },
    //     axisBorder: { show: false },
    //     axisTicks: { show: false },
    //   },

    //   yaxis: {
    //     labels: { style: { colors: "#7A6A58" } },
    //   },

    //   grid: {
    //     borderColor: "#e7e1db",
    //     strokeDashArray: 4,
    //   },
    // };

    const options = {
  chart: {
    type: "area",
    height: 320,
    toolbar: { show: false },
    animations: { enabled: false },
  },

  series: [
    {
      name: "Total Transactions",
      data: amounts,
    },
  ],

  stroke: {
    curve: "smooth",
    width: 5,
    colors: ["#C28E72"],
  },

  markers: {
    size: 6,
    colors: ["#C28E72"],
    strokeColors: "#fff",
    strokeWidth: 2,
    hover: { size: 8 },
  },

  dataLabels: {
    enabled: true,
    style: {
      colors: ["#C28E72"],
      fontSize: "12px",
      fontWeight: "bold",
    },
  },

  fill: {
    type: "gradient",
    gradient: {
      opacityFrom: 0.45,
      opacityTo: 0,
      colorStops: [
        { offset: 0, color: "#EDD5C4", opacity: 0.45 },
        { offset: 50, color: "#D7B59A", opacity: 0.3 },
        { offset: 100, color: "#C28E72", opacity: 0.2 },
      ],
    },
  },

  xaxis: {
    categories: months,
    labels: {
      style: { fontSize: "13px", colors: "#7A6A58" },
    },
  },

  yaxis: {
    min: Math.min(...amounts) - 100,
    max: Math.max(...amounts) + 100,
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
  }, [amounts, months]);

  return (
    <div className="w-full bg-white rounded-2xl shadow p-6">
      {/* ✅ TOTAL (Payin + Payout) */}
      <h1 className="text-4xl font-bold text-gray-900">
        ₹{totalAmount}
      </h1>

      <div ref={chartRef}></div>
    </div>
  );
};
