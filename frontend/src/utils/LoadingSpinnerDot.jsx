import React from "react";
import '../style/utils/LoadingDotCircle.css'

const LoadingSpinnerDot = ({
  text = "Loading...",
  size = 42
}) => {
  return (
    <div className="lsd-wrapper">
      <div
        className="lsd-spinner"
        style={{ width: size, height: size }}
      >
        <div className="lsd-ring"></div>

        <div className="lsd-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {text && <p className="lsd-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinnerDot;
