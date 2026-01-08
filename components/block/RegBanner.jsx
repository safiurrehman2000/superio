import Image from "next/image";
import Link from "next/link";

const RegBanner = () => {
  const regBannerContent = [
    {
      id: 1,
      name: "Nieuwe Flexijobbers inzetten? Daar hoort loonadministratie bij!",
      text: `Time is money, ook bij loonadministratie.
Het kan altijd beter, efficiënter, vlotter en vooral goedkoper.

Ga jij flexi’s in dienst nemen?
Wil je een vrijblijvende vergelijking?`,
      avatar: "/images/resource/employ.png",
      link: "/contact",
      buttonText: "Meer informatie",
    },
    {
      id: 2,
      name: "Waarom kiezen voor De Flexijobber als werkgever?",
      text: `Wist je dat 70% van alle sollicitanten vacatures vindt via Google?

Via De Flexijobber vergroot je jouw bereik aanzienlijk.`,
      avatar: "/images/resource/candidate.png",
      link: "/platform",
      buttonText: "Ontdek het platform",
    },
  ];

  return (
    <>
      {regBannerContent.map((item) => (
        <div className="col-lg-6 col-md-12 col-sm-12" key={item.id}>
          <div className="reg-banner-card">
            {/* Image */}
            <div className="reg-banner-image">
              <Image
                src={item.avatar}
                alt={item.name}
                fill
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Content */}
            <div className="reg-banner-content">
              <h3>{item.name}</h3>
              <p>{item.text}</p>

              <Link href={item.link} className="theme-btn btn-style-five">
                {item.buttonText}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default RegBanner;


