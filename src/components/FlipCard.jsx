import { useState } from "react";

export const FlipCard = ({ frontContent, backContent, width = "w-full", height = "h-full" }) => {
  const [isFront, setIsFront] = useState(true);

  return (
    <div className={`${width} ${height} bg-white rounded-xl border border-[#e6ded4] shadow-sm flex flex-col`}>
      {/* Toggle Tabs */}
      <div className="flex border-b border-[#e6ded4] rounded-t-xl overflow-hidden select-none">
        <button
          onClick={() => setIsFront(true)}
          className={`flex-1 py-3 text-center text-sm font-semibold f-6 transition-colors cursor-pointer ${
            isFront ? "bg-[#f7f3ee] text-[#4d443b]" : "bg-white text-[#a39c90] hover:bg-[#f7f3ee]"
          }`}
        >
          Transaction Status
        </button>
        <button
          onClick={() => setIsFront(false)}
          className={`flex-1 py-3 text-center text-sm font-semibold transition-colors cursor-pointer ${
            !isFront ? "bg-[#f7f3ee] text-[#4d443b]" : "bg-white text-[#a39c90] hover:bg-[#f7f3ee]"
          }`}
        >
          Top Transactions
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 overflow-auto">
        {isFront ? frontContent : backContent}
      </div>
    </div>
  );
};


