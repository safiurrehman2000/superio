import React from "react";

const Loading = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ height: "11rem" }}
    >
      <div className="d-flex gap-2">
        {/* Animated circles */}
        <div
          className="rounded-circle"
          style={{
            width: "1rem",
            height: "1rem",
            animation: "bounce 0.6s infinite alternate",
            background: "#FA5508",
          }}
        ></div>
        <div
          className="rounded-circle"
          style={{
            width: "1rem",
            height: "1rem",
            animation: "bounce 0.6s infinite alternate 0.2s",
            background: "#FA5508",
          }}
        ></div>
        <div
          className="rounded-circle"
          style={{
            width: "1rem",
            height: "1rem",
            animation: "bounce 0.6s infinite alternate 0.4s",
            background: "#FA5508",
          }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-1rem);
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
