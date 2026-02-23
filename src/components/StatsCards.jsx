// components/StatsCards.jsx
import { useState } from "react";

export default function StatsCards({ inCard, outCard, totalCards }) {
  const [showToday, setShowToday] = useState(false);

  // Reusable card component
   const StatCard = ({
    title,
    value,
    icon,
    gradientFrom,
    gradientVia,
    gradientTo,
  }) => {
    return (
      <div
        className={`
          p-3 rounded-2xl shadow-xl
          bg-gradient-to-br from-[${gradientFrom}] via-[${gradientVia}] to-[${gradientTo}]
          border border-[#d7c4a8]
          transition-all hover:scale-[1.03] hover:shadow-2xl
        `}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-[#6e5e50]">
            {title}
          </p>
          <i className={`fa-solid ${icon} text-2xl`}></i>
        </div>

        <div className="text-xl font-bold text-[#4d443b]">
          ₹ {value}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

      {/* Total Payin */}
      <StatCard
        title="Total Payin Collection"
        value={inCard.total}
        icon="fa-wallet text-[#b58351]"
        gradientFrom="#f1d9b7"
        gradientVia="#f4e4cf"
        gradientTo="#e7d8c2"
      />

      {/* Today Payin */}
      <StatCard
        title="Today Payin Collection"
        value={inCard.today}
        icon="fa-arrow-trend-up text-green-600"
        gradientFrom="#f7ead8"
        gradientVia="#f4dfc7"
        gradientTo="#ecd3b1"
      />

      {/* Total Payout */}
      <StatCard
        title="Total Payout Collection"
        value={outCard.total}
        icon="fa-arrow-trend-down text-red-500"
        gradientFrom="#fae6e1"
        gradientVia="#f8d6cc"
        gradientTo="#f2c4b7"
      />

      {/* Today Payout */}
      <StatCard
        title="Today Payout Collection"
        value={outCard.today}
        icon="fa-arrow-trend-down text-red-500"
        gradientFrom="#e9f8e7"
        gradientVia="#d9f4d3"
        gradientTo="#c7eebe"
      />
    </div>
  );
}