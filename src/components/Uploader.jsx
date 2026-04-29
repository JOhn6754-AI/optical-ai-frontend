import { useState, useRef } from "react";
import CSVTemplateDropdown from "./CSVTemplateDropdown";

export default function Uploader({ onUpload, loading, error }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    onUpload(file);
  };

  // Fix: need all four drag events for reliable cross-browser drag-drop
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    handleFile(file);
  };

  const handleChange = (e) => {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // reset so same file can be re-uploaded
  };

  return (
    <div className="uploader-wrap">
      <div
        className={`drop-zone ${dragging ? "dragging" : ""} ${loading ? "loading" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === "Enter" && inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          style={{ display: "none" }}
        />

        {loading ? (
          <div className="drop-inner">
            <div className="spinner" />
            <p className="drop-title">Analyzing jobs...</p>
            <p className="drop-sub">
              Geocoding addresses and calculating real drive times.
              This takes 10–20 seconds for a typical week.
            </p>
          </div>
        ) : (
          <div className="drop-inner">
            <div className="drop-icon">⬆</div>
            <p className="drop-title">
              {fileName ? `✓ ${fileName}` : "Drop CSV here or click to browse"}
            </p>
            <p className="drop-sub">
              Accepts .csv files — drag from Finder or click to open file picker
            </p>
          </div>
        )}
      </div>
      
      <div style={{ marginTop: 12 }}>
        <CSVTemplateDropdown />
      </div>

      {error && (
        <div className="error-banner">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
