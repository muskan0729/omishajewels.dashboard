// components/StatsCards.jsx
import { useState } from "react";

export default function StatsCards({ inCard, outCard, totalCards }) {
  const [showToday, setShowToday] = useState(false);

  // Reusable card component
  const StatCard = ({
    title,
    totalValue,
    todayValue,
    iconTotal,
    iconToday,
    gradientFrom,
    gradientVia,
    gradientTo,
    showButton = false,
    onToggle,
    showTodayState,
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
            {showTodayState ? `Today ${title}` : `Total ${title}`}
          </p>
          <i
            className={`fa-solid ${showTodayState ? iconToday : iconTotal} text-2xl`}
          ></i>
        </div>
        <div className="text-xl font-bold text-[#4d443b]">
          ₹ {showTodayState ? todayValue : totalValue}
        </div>

        {/* Show toggle button inside the first card */}
        {showButton && (
          <div className="flex justify-center mt-4">
            <span
              onClick={onToggle}
              className="text-[#b58351] hover:text-[#b58351] cursor-pointer font-medium transition-colors"
            >
              Show {showTodayState ? "Total" : "Today"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Collection"
          totalValue={totalCards.total}
          todayValue={totalCards.today}
          iconTotal="fa-wallet text-[#b58351]"
          iconToday="fa-arrow-trend-up text-green-600"
          gradientFrom="#f1d9b7"
          gradientVia="#f4e4cf"
          gradientTo="#e7d8c2"
          showButton={true} // show toggle button
          onToggle={() => setShowToday(!showToday)} // toggle function
          showTodayState={showToday} // current state
        />

        <StatCard
          title="PayIn Collection"
          totalValue={inCard.total}
          todayValue={inCard.today}
          iconTotal="fa-wallet text-[#b58351]"
          iconToday="fa-arrow-trend-up text-green-600"
          gradientFrom="#f7ead8"
          gradientVia="#f4dfc7"
          gradientTo="#ecd3b1"
          showTodayState={showToday}
        />

        <StatCard
          title="PayOut Collection"
          totalValue={outCard.total}
          todayValue={outCard.today}
          iconTotal="fa-arrow-trend-down text-red-500"
          iconToday="fa-arrow-trend-down text-red-500"
          gradientFrom="#fae6e1"
          gradientVia="#f8d6cc"
          gradientTo="#f2c4b7"
          showTodayState={showToday}
        />

        <StatCard
          title="Profit Collection"
          totalValue={outCard.total}
          todayValue={outCard.today}
          iconTotal="fa-coins text-yellow-600"
          iconToday="fa-coins text-yellow-600"
          gradientFrom="#e9f8e7"
          gradientVia="#d9f4d3"
          gradientTo="#c7eebe"
          showTodayState={showToday}
        />
      </div>
    </div>
  );
}
