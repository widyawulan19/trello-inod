const ToggleSwitch = ({ active, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      style={{
        width: "43px",
        height: "20px",
        borderRadius: "20px",
        backgroundColor: active ? "#1c982a" : "#eee",
        display: "flex",
        alignItems: "center",
        padding: "3px",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.25s ease",
        // boxShadow:"0px 4px 8px rgba(0, 0, 0, 0.1)"
      }}
    >

      {/* TEXT DI PINGGIR ICON */}
      <span
        style={{
          position: "absolute",
          left: active ? "3px" : "auto",
          right: active ? "auto" : "3px",
          color: active ? "#ffffff" : "#555",
          fontSize: "8px",
          fontWeight: "600",
          userSelect: "none",
          transition: "0.25s ease",
        }}
      >
        {active ? "" : "OFF"}
      </span>

      {/* CIRCLE */}
      <div
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transform: active ? "translateX(22px)" : "translateX(0px)",
          transition: "transform 0.25s ease",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.5)",
        }}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
