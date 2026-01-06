import React, { useState } from "react";


const DashboardSkeleton = () => {

  const [role] = useState(atob(localStorage.getItem("role")) || "admin");
  
  return (
    <div className="flex min-h-screen bg-[#fefcf9]">
      <div className="flex-1 p-6 lg:p-10 animate-pulse">

        {/* ================= TOP KPI CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border shadow-sm p-6"
              style={{ background: "#fff", borderColor: "#e6ded4" }}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-4 w-32 bg-[#e6ded4] rounded" />
                <div className="h-6 w-6 bg-[#e6ded4] rounded" />
              </div>

              <div className="h-8 w-28 bg-[#e6ded4] rounded mb-4" />

              <div className="h-4 w-20 bg-[#f0ebe6] rounded" />
            </div>
          ))}
        </div>

        {/* ================= CHART SECTION ================= */}
        {role === "admin" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">

          {/* Left Flip Card Skeleton */}
          <div
            className="xl:col-span-1 rounded-2xl border shadow-sm p-6 flex flex-col items-center justify-center"
            style={{ background: "#fff", borderColor: "#e6ded4" }}
          >
            <div className="h-5 w-40 bg-[#e6ded4] rounded mb-6" />
            <div className="w-48 h-48 rounded-full bg-[#f0ebe6]" />
            <div className="mt-6 space-y-2 w-full">
              <div className="h-3 w-24 bg-[#e6ded4] rounded mx-auto" />
              <div className="h-3 w-32 bg-[#e6ded4] rounded mx-auto" />
            </div>
          </div>

          {/* Monthly Revenue Skeleton */}
          <div
            className="xl:col-span-2 rounded-2xl border shadow-sm p-6"
            style={{ background: "#fff", borderColor: "#e6ded4" }}
          >
            <div className="h-5 w-40 bg-[#e6ded4] rounded mb-6" />
            <div className="h-64 bg-[#f0ebe6] rounded" />
          </div>
        </div>
        )}

        {/* ================= TABLE SECTION ================= */}
        <div
          className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: "#fff", borderColor: "#e6ded4" }}
        >
          {/* Table Header */}
          <div
            className="px-6 py-4"
            style={{ background: "#f7f3ee" }}
          >
            <div className="h-5 w-48 bg-[#e6ded4] rounded" />
          </div>

          {/* Table Rows */}
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, row) => (
              <div
                key={row}
                className="flex justify-between items-center border-b pb-3"
                style={{ borderColor: "#f0ebe6" }}
              >
                {[...Array(6)].map((__, col) => (
                  <div
                    key={col}
                    className="h-4 w-24 bg-[#e6ded4] rounded"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>


      </div>
    </div>
  );
};

export default DashboardSkeleton;
