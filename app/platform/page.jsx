import Link from "next/link";

export const metadata = {
  title: "De Flexijobber Platform | Voor Werkgevers",
};

const PlatformPage = () => {
  return (
    <section className="platform-page">
      <div className="auto-container">
        {/* Header */}
        <div className="platform-header text-center">
          <h1>DE FLEXIJOBBER PLATFORM</h1>
          <p>
            Waarom kiezen voor ons platform De Flexijobber als werkgever?
          </p>
        </div>

        {/* Content */}
        <div className="platform-content">
          <ul className="platform-list">
            <li>Eerste vacature plaatsen is altijd gratis.</li>
            <li>
              Volledige begeleiding om jouw vacature aantrekkelijk te adverteren.
            </li>
            <li>Jouw vacature wordt automatisch geplaatst op Google Jobs.</li>
            <li>
              Wij adverteren ook via sociale media om het bereik te vergroten.
            </li>
            <li>
              Extra bedrijfsomschrijving en video toevoegen aan je vacature.
            </li>
            <li>
              Dagelijks groeiende database met actieve sollicitanten.
            </li>
            <li>
              Geen rekrutering, maar gerichte mailings naar kandidaten.
            </li>
            <li>
              Google legt een directe link tussen jouw vacature en ons platform.
            </li>
            <li>
              Gratis persoonlijk dashboard voor opvolging van sollicitanten.
            </li>
            <li>Inzicht in het aantal views per vacature.</li>
            <li>Mogelijkheid om vacaturebundels aan te kopen.</li>
            <li>Vacatures op elk moment aanpassen.</li>
            <li>Alle cv’s rechtstreeks in je mailbox.</li>
            <li>Handige chatfunctie voor snelle ondersteuning.</li>
            <li>
              Via WhatsApp adverteer je jouw vacature in 2 minuten.
            </li>
            <li>
              Persoonlijk contact – geen anoniem platform.
            </li>
            <li>
              Geen tijd? Gebruik spraak via WhatsApp om te adverteren.
            </li>
            <li>
              Wij begeleiden je van A tot Z bij loonadministratie.
            </li>
          </ul>

          {/* CTA */}
          <div className="platform-cta">
            <Link href="/contact" className="theme-btn btn-style-five">
              Neem contact op
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformPage;

