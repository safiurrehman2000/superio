"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

const WhatsAppWidget = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        className="whatsapp-fab"
        onClick={() => setOpen(!open)}
        aria-label="Open WhatsApp"
      >
        <MessageCircle size={26} />
      </button>

      {open && (
        <div className="whatsapp-popup-root">
          <div className="whatsapp-popup">
            <button
              className="popup-close"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>

            {/* HEADER */}
            <div className="whatsapp-header">
            <i className="fab fa-whatsapp whatsapp-logo" />
            <div>
                <h4>Een gesprek starten</h4>
                <p>
                Plaats je vacature in een handomdraai of stel je vraag via WhatsApp
                </p>
            </div>
            </div>

            {/* OPTIONS */}
            <a
              href="https://wa.me/32479294276?text=Hoi!%20Ik%20ben%20klaar%20om%20een%20vacature%20te%20plaatsen."
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-card"
            >
              <span className="card-title">Direct vacature plaatsen</span>
              <span className="card-desc">
                Plaats snel je vacature en bereik de juiste kandidaten!
              </span>
            </a>

            <a
              href="https://wa.me/32491100143?text=Hallo!%20Ik%20heb%20een%20vraag.%20Hoe%20kunnen%20jullie%20me%20helpen?"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-card"
            >
              <span className="card-title">Algemene vragen</span>
              <span className="card-desc">
                Vragen? Wij helpen je graag verder!
              </span>
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
