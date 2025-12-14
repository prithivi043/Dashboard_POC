// src/components/DateFilter.jsx
import React from "react";

const DateFilter = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[14px] font-medium text-slate-600">
        Date filter
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-white border border-[#D0D0D0] rounded-lg px-3 py-2 text-[14px] text-[#727272] cursor-pointer
                   hover:border-[#9ECFBF] focus:border-[#54BD95] focus:ring-2 focus:ring-[#C9E8DD]
                   transition-all shadow-sm"
      >
        <option value="all">All time</option>
        <option value="today">Today</option>
        <option value="last7">Last 7 days</option>
        <option value="last30">Last 30 days</option>
        <option value="last90">Last 90 days</option>
      </select>
    </div>
  );
};

export default DateFilter;
