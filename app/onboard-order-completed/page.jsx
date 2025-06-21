import React from "react";
import OnboardOrderCompleted from "./components/OnboardOrderCompleted";

export default function page() {
  return (
    <section className="order-confirmation">
      <div className="auto-container">
        <OnboardOrderCompleted />
      </div>
    </section>
  );
}
