import React, { useState, useCallback } from "react";
import { FiUpload } from "react-icons/fi";
import * as XLSX from "xlsx";

const ExcelUpload = ({ onDataParsed }) => {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const allowedExtensions = [".xlsx", ".xls"];

  const validateFile = (file) => {
    if (!file) return { ok: false, msg: "No file selected." };

    const lower = file.name.toLowerCase();
    const isValid = allowedExtensions.some((ext) => lower.endsWith(ext));

    if (!isValid) {
      return {
        ok: false,
        msg: "Please upload a valid Excel file (.xlsx or .xls).",
      };
    }
    return { ok: true, msg: "" };
  };

  const parseFile = async (file) => {
    setError("");
    setIsParsing(true);
    try {
      const buf = await file.arrayBuffer();
      const workbook = XLSX.read(buf, { type: "array" });

      const sheets = {};
      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        sheets[sheetName] = XLSX.utils.sheet_to_json(sheet, { defval: null });
      });

      const payload = {
        sheets,
        workbookMeta: { sheetNames: workbook.SheetNames },
        rawFile: file,
      };

      if (typeof onDataParsed === "function") onDataParsed(payload);
    } catch (e) {
      console.error(e);
      setError("Failed to read the Excel file. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleFiles = useCallback((fileList) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const validation = validateFile(file);
    if (!validation.ok) {
      setError(validation.msg);
      return;
    }

    setFileName(file.name);
    parseFile(file);
  }, []);

  const onInputChange = (e) => handleFiles(e.target.files);

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900">
            Upload Excel data
          </h3>
          <p className="text-xs text-slate-500">
            Supported: <span className="font-medium">.xlsx</span>,{" "}
            <span className="font-medium">.xls</span>
          </p>
        </div>
      </div>

      <div
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          isDragActive
            ? "border-emerald-500 bg-emerald-50"
            : "border-slate-300 bg-slate-50 hover:bg-slate-100"
        }`}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById("excel-upload-input")?.click()}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold">
          <FiUpload className="text-xl" />
        </div>
        <p className=" text-slate-700" style={{ fontSize: "12px" }}>
          <span className="font-semibold ">Drag and drop</span> your Excel file
          here, or{" "}
          <span className="font-semibold text-emerald-600">
            click to browse
          </span>
          .
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          1 file at a time. Only .xlsx / .xls.
        </p>

        <input
          id="excel-upload-input"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {fileName && (
        <p className="text-[11px] text-slate-500">
          Selected file: <span className="font-medium">{fileName}</span>
        </p>
      )}

      {isParsing && (
        <p className="text-[11px] text-emerald-600">
          Reading and parsing Excel file…
        </p>
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
};

export default ExcelUpload;
