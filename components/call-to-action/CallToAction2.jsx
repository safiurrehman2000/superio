import Link from "next/link";

const CallToAction2 = () => {
  return (
    <section
      className="call-to-action-two"
      style={{
        position: "relative",
        backgroundImage: "url(/images/background/14.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(45deg, rgba(16,231,220,0.45) 0%, rgba(0,116,225,0.7) 70%)",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        className="auto-container"
        data-aos="fade-up"
        style={{ position: "relative", zIndex: 2 }}
      >
        <div className="sec-title light text-center">
          <h2>Maak het verschil met je Flexi-Job CV!</h2>
          <div className="text">
            Maak vandaag nog een account aan ! ( Login/Registreer). Vervolledig
            jouw profiel op het dashboard. Upload jouw CV. Benadruk jouw
            vaardigheden en ervaring en kies de flexi-job die het best bij jouw
            past. Volg alle sollicitaties heel eenvoudig op via het dashboard.
            Volg ons ook op Facebook voor de laatste nieuwe vacatures. Schrijf je
            in voor onze nieuwsbrief om op de hoogte te blijven van leuk nieuws
            in de wereld van De Flexijobber. Heb je nog vragen? Raadpleeg de FAQ
            onder de rubriek Flexi-Jobbers. Gebruik onze WhatsApp chat — wij
            helpen je graag verder.
          </div>
        </div>

        <div className="btn-box">
          <Link href="/job-list" className="theme-btn btn-style-one">
            Zoek Vacature
          </Link>
          <Link
            target="_blank"
            href="https://www.facebook.com/people/Flexi-jobber-Vlaanderen/61571515856408/"
            className="theme-btn btn-style-four"
          >
            Volg ons op Facebook
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction2;

