import Link from "next/link";

const PlatformContent = () => {
  const items = [
    "Eerste vacature plaatsen is altijd gratis.",
    "Volledige begeleiding om jouw vacature zo aantrekkelijk mogelijk te adverteren.",
    "Jouw vacature wordt ook geplaatst op Google Jobs.",
    "Wij adverteren ook via sociale media om het bereik te vergroten.",
    "Extra bedrijfsomschrijving en video URL toevoegen aan je vacature.",
    "Dagelijks groeiende database met sollicitanten.",
    "Geen recrutering maar gerichte mailings naar kandidaten.",
    "Google maakt een link tussen De Flexijobber en jouw vacature.",
    "Gratis persoonlijk dashboard voor opvolging van sollicitanten.",
    "Volg het aantal views van de vacature.",
    "Vacaturebundels aankopen via dashboard.",
    "Vacatures meteen aanpassen.",
    "Alle cv’s komen rechtstreeks in je mailbox.",
    "Handige chatfunctie – wij beantwoorden al je vragen.",
    "Via WhatsApp adverteer je zelf in 2 minuten.",
    "Persoonlijk contact, geen anoniem platform.",
    "Geen tijd? Gebruik je stem via WhatsApp.",
    "Wij begeleiden je van A tot Z bij loonadministratie.",
  ];

  return (
    <>
      {/* Titel */}
      <div className="sec-title light text-center">
        <div className="text">
          Waarom kiezen voor De Flexijobber platform als werkgever?
        </div>
      </div>

      {/* Content */}
      <div className="text-box">
        <div className="row">
          <div className="col-lg-12">
            <ul className="platform-list">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            {/* CTA */}
            <div className="text-center" style={{ marginTop: "40px" }}>
              <Link href="/contact" className="theme-btn btn-style-five">
                Neem contact op
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlatformContent;
