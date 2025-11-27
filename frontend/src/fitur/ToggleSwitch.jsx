const ToggleSwitch = ({ active, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      style={{
        width: "60px",
        height: "26px",
        borderRadius: "20px",
        backgroundColor: active ? "#26d63b" : "#e5e5e5",
        display: "flex",
        alignItems: "center",
        padding: "3px",
        cursor: "pointer",
        position: "relative",
        transition: "background-color 0.25s ease",
      }}
    >

      {/* TEXT DI PINGGIR ICON */}
      <span
        style={{
          position: "absolute",
          left: active ? "6px" : "auto",
          right: active ? "auto" : "6px",
          color: active ? "#ffffff" : "#555",
          fontSize: "9px",
          fontWeight: "600",
          userSelect: "none",
          transition: "0.25s ease",
        }}
      >
        {active ? "ON" : "OFF"}
      </span>

      {/* CIRCLE */}
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transform: active ? "translateX(32px)" : "translateX(0px)",
          transition: "transform 0.25s ease",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.3)",
        }}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
