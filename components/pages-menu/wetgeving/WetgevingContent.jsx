import Image from "next/image";
import image1 from "../../../public/images/image1.webp";
import image2 from "../../../public/images/image2.webp";
import image3 from "../../../public/images/image3.webp";
import image4 from "../../../public/images/image4.webp";
import image5 from "../../../public/images/image5.webp";
import image6 from "../../../public/images/image66.webp";

const WetgevingContent = () => {
  const sections = [
    {
      id: 1,
      heading:
        "Uw loopbaan binnen handbereik",
      description:
        "Mycareer.be is een online app die u een duidelijk overzicht geeft van uw Belgische loopbaan.",
      image: image1,
      url: "https://www.mycareer.be/fr/",
    },
    {
      id: 2,
      heading: "VOOR GEPENSIONEERDEN",
      description:
        "Voor al uw vragen rond uw pensioen raadpleeg uw online pensioendossier.",
      image: image2,
      url: "https://www.mypension.be/nl",
    },
    {
      id: 3,
      heading: "VOOR STUDENTEN",
      description:
        "Voor al uw vragen met betrekking tot het uitoefenen van uw studentenjob raadpleeg uw online dossier.",
      image: image3,
      url: "https://www.studentatwork.be/nl/",
    },
    {
      id: 4,
      heading: "VOOR WERGEVERS",
      description:
        "Voor al uw vragen en het ingeven van een DIMONA-aangifte raadpleeg de website van de sociale zekerheid.",
      image: image4,
      url: "https://www.socialsecurity.be/site_nl/employer/applics/dimona/general/how.htm",
    },
    {
      id: 5,
      heading: "VRAGEN",
      description:
        "Voor al uw vragen met betrekking tot het uitoefenen van uw flexi-job kan u terecht op Vlaanderen.be.",
      image: image5,
      url: "https://www.vlaanderen.be",
    },
    {
      id: 6,
      heading: "BELASTINGEN",
      description:
        "Voor al uw vragen rond belastingen en belastingaangiften.",
      image: image6,
      url: "https://financien.belgium.be",
    },
  ];

  return (
    <>
      {sections.map((section) => (
        <div
          key={section.id}
          className="text-box"
          style={{ marginBottom: "40px" }}
        >
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12">
              <h3>{section.heading}</h3>
              <p>{section.description}</p>
            </div>

            <div className="col-lg-6 col-md-12">
              <figure className="image" style={{ marginTop: "20px" }}>
                <a
                  href={section.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    width={600}
                    height={400}
                    src={section.image}
                    alt={section.heading}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  />
                </a>
              </figure>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default WetgevingContent;
