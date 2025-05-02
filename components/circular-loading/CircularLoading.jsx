"use client";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CircularLoader = ({ size = 24, strokeColor = "#fff" }) => {
  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <div
        style={{
          width: size,
          height: size,
          display: "inline-block",
          verticalAlign: "middle",
        }}
      >
        <CircularProgressbar
          value={75} // Fixed value for consistent appearance
          styles={{
            root: {
              width: "100%",
              height: "100%",
              animation: "spin 1s linear infinite", // CSS rotation animation
            },
            path: {
              stroke: strokeColor,
              strokeLinecap: "butt", // Cleaner edges
            },
            trail: { stroke: "transparent" },
            text: { display: "none" }, // Hide percentage text
          }}
        />
      </div>
    </>
  );
};

export default CircularLoader;
