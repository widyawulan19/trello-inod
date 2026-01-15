import React, { useState } from "react";
import LoadingSpinnerDot from "../utils/LoadingSpinnerDot";

const LoadingTest = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const simulateFetch = () => {
    setLoading(true);
    setData(null);

    // simulasi request API 2.5 detik
    setTimeout(() => {
      setData("🎉 Data berhasil dimuat!");
      setLoading(false);
    }, 2500);
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px" }}>
      <h2>Loading Animation Test</h2>

      <button
        onClick={simulateFetch}
        style={{
          marginBottom: "20px",
          padding: "8px 14px",
          borderRadius: "6px",
          background: "#7a3fff",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        Test Loading
      </button>

      {/* 🔄 LOADING */}
      {loading && <LoadingSpinnerDot text="Fetching data..." />}

      {/* ✅ RESULT */}
      {!loading && data && (
        <p style={{ marginTop: "16px", color: "#16a34a" }}>{data}</p>
      )}
    </div>
  );
};

export default LoadingTest;
