import Link from "next/link";

const CallToAction2 = () => {
  return (
    <section
      className="call-to-action-two"
      style={{ backgroundImage: "url(/images/background/1.jpg)" }}
    >
      <div className="auto-container" data-aos="fade-up">
        <div className="sec-title light text-center">
          <h2>Maak het verschil met je Flexi-Job CV!</h2>
          <div className="text">
            Maak vandaag nog een account aan ! ( Login/Registreer). Vervolledig
            jouw profiel op het dashboard. Upload jouw CV. Benadruk jouw
            vaardigheden en ervaring en kies de flexi-job die het best bij jouw
            past. Volg alle sollicitaties heel eenvoudig op via het dashboard.
            Volg ons ook op Facebook voor de laatste nieuwe vacatures Schrijf je
            in voor onze nieuwsbrief om op de hoogte te blijven van leuk nieuws
            in de wereld van De flexijobber. Heb je nog vragen ? Raadpleeg de
            FAQ vragen onder de rubriek Flexi-Jobbers. Gebruik onze WhatsApp
            chat. Wij helpen je graag verder.
          </div>
        </div>

        <div className="btn-box">
          <Link href="/job-list" className="theme-btn btn-style-one">
            Search Job
          </Link>
          <Link
            target="_blank"
            href="https://www.facebook.com/people/Flexi-jobber-Vlaanderen/61571515856408/"
            className="theme-btn btn-style-four"
          >
            Follow us on Facebook
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction2;
