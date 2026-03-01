import React from "react";
import "@/styles/customStyles.css";

const dotStyle = (delay) => ({
  width: "1rem",
  height: "1rem",
  animation: `loading-bounce 0.6s infinite alternate ${delay}`,
  background: "#FA5508",
});

const Loading = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "11rem" }}
    >
      <div className="d-flex gap-2">
        <div className="rounded-circle" style={dotStyle("0s")} />
        <div className="rounded-circle" style={dotStyle("0.2s")} />
        <div className="rounded-circle" style={dotStyle("0.4s")} />
      </div>
    </div>
  );
};

export default Loading;
