"use client";

import { useEffect, useState } from "react";

export default function TestVacanciesPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // toon popup alleen als gebruiker ze nog niet gesloten heeft
    const dismissed = localStorage.getItem("testVacanciesPopupDismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem("testVacanciesPopupDismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <h3>⚠️ Testfase</h3>
        <p>
          De vacatures op <strong>De Flexijobber</strong> zijn momenteel
          <strong> testvacatures</strong>.
        </p>
        <p>
          Gelieve <strong>niet te solliciteren</strong>.
          <br />
          We werken actief aan een betere versie van de website.
        </p>

        <button onClick={closePopup}>Ok, begrepen</button>
      </div>
    </div>
  );
}
