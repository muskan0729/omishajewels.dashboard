import { useEffect, useRef, useMemo } from "react";

export const LineChart = ({ data }) => {
  const chartRef = useRef(null);

  const MONTH_SHORT_MAP = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",

    // safety (agar already short aaye)
    Jan: "Jan",
    Feb: "Feb",
    Mar: "Mar",
    Apr: "Apr",
    Jun: "Jun",
    Jul: "Jul",
    Aug: "Aug",
    Sep: "Sep",
    Oct: "Oct",
    Nov: "Nov",
    Dec: "Dec",
  };

  // 🔹 Normalize API data
  const chartData = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => {
        // Take only month part, remove year if exists
        const rawMonth = item.month_name
          ? item.month_name.split(" ")[0]
          : "Month";

        const shortMonth =
          MONTH_SHORT_MAP[rawMonth] || rawMonth.substring(0, 3);

        return {
          month: shortMonth,
          total:
            (Number(item.payin_amount) || 0) +
            (Number(item.payout_amount) || 0),
        };
      });
    }

    const fallbackMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return fallbackMonths.map((m) => ({ month: m, total: 0 }));
  }, [data]);

  const amounts = chartData.map((d) => d.total);
  const months = chartData.map((d) => d.month);
  const totalAmount = amounts.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (!window.ApexCharts || !chartRef.current) return;

    const options = {
      chart: {
        type: "area",
        height: 340,
        toolbar: { show: false },
        zoom: { enabled: false },
      },

      series: [
        {
          name: "Total Cash Flow",
          data: amounts,
        },
      ],

      stroke: {
        curve: "smooth",
        width: 4,
        colors: ["#B58351"],
      },

      markers: {
        size: 6,
        colors: ["#B58351"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 9 },
      },

      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0,
          colorStops: [
            { offset: 0, color: "#F1D9B7", opacity: 0.6 },
            { offset: 60, color: "#D7A874", opacity: 0.35 },
            { offset: 100, color: "#B58351", opacity: 0.1 },
          ],
        },
      },

      dataLabels: {
        enabled: false,
      },

      tooltip: {
        theme: "light",

        marker: {
          fillColors: ["#B58351"],
        },

        x: {
          formatter: (val) => `Month: ${val}`,
        },
        y: {
          formatter: (val) => `₹${Number(val).toLocaleString("en-IN")}`,
          title: {
            formatter: () => "Revenue",
          },
        },
      },

      xaxis: {
        categories: months,

        labels: {
          rotate: 0,
          rotateAlways: true,
          trim: false,
          hideOverlappingLabels: false,

          offsetX: 5,
          offsetY: 6,

          style: {
            fontSize: "13px",
            colors: "#7A6A58",
            fontWeight: 500,
          },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },

      yaxis: {
        labels: {
          formatter: (val) => `₹${Number(val / 100000).toFixed(1)}L`,
          style: {
            colors: "#7A6A58",
          },
        },
      },

      grid: {
        borderColor: "#eee6dc",
        strokeDashArray: 5,
      },
    };

    const chart = new window.ApexCharts(chartRef.current, options);
    chart.render();

    return () => chart.destroy();
  }, [amounts, months]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* RIGHT: TITLE */}
        <div>
          <h3 className="text-xl font-semibold text-[#4d443b]">
            Revenue Performance
          </h3>
          <p className="text-sm text-[#9c8a78]">
            Monthly cash flow overview (Pay-In + Pay-Out)
          </p>
        </div>

        {/* LEFT: TOTAL */}
        <div>
          <h1 className="text-2xl font-bold text-[#4d443b] leading-tight">
            ₹{Number(totalAmount).toLocaleString("en-IN")}
          </h1>
          <p className="text-sm text-green-600 font-medium md:text-right mr-6">
            Cumulative Revenue
          </p>
        </div>
      </div>

      {/* CHART */}
      <div ref={chartRef} />
    </div>
  );
};
