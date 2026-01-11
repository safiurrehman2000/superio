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
      avatar: "/images/resource/loonadministratie.jpg",
      link: "/contact",
      buttonText: "Meer informatie",
    },
    {
      id: 2,
      name: "Waarom kiezen voor De Flexijobber als werkgever?",
      text: `Wist je dat 70% van alle sollicitanten vacatures vindt via Google?

Via De Flexijobber vergroot je jouw bereik aanzienlijk.`,
      avatar: "/images/resource/werkgever.jpg",
      link: "/platform",
      buttonText: "Ontdek het platform",
    },
  ];

  return (
    <div className="row reg-banner-row">
      {regBannerContent.map((item) => (
        <div
          className="col-lg-6 col-md-12 col-sm-12 reg-banner-col"
          key={item.id}
        >
          <div className="reg-banner-card">
            {/* Image */}
            <div className="reg-banner-image">
              <div className="reg-banner-image-inner">
                <Image
                  src={item.avatar}
                  alt="Banner afbeelding"
                  fill
                  className="reg-banner-img"
                  priority
                />
              </div>
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
    </div>
  );
};

export default RegBanner;

