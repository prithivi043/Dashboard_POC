import React from "react";

const KpiCard = ({ label, value, sublabel }) => {
  return (
    <div className="card p-4 flex flex-col justify-between">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      {sublabel && (
        <p className="mt-1 text-xs text-slate-400">{sublabel}</p>
      )}
    </div>
  );
};

export default KpiCard;
