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
        "Uw loopbaan binnen handbereik Mycareer.be is een online app die u een duidelijk overzicht geeft van uw Belgische loopbaan.",
      description: "http://www.mycareer.be/",
      image: image1,
    },
    {
      id: 2,
      heading: "VOOR GEPENSIONEERDEN",
      description:
        "Voor al uw vragen rond uw pensioen raadpleeg uw online pensioendossier",
      image: image2,
    },
    {
      id: 3,
      heading: "VOOR STUDENTEN",
      description:
        "Voor al uw vragen mbt tot het uitoefenen van uw studentenjob raadpleeg uw online dossier",
      image: image3,
    },
    {
      id: 4,
      heading: "VOOR WERGEVERS",
      description:
        "Voor al uw vragen mbt het uitoefenen van uw flexi-job kan u ook surfen naar de website vlaanderen.be:",
      image: image4,
    },
    {
      id: 5,
      heading: "VRAGEN",
      description:
        "Voor al uw vragen en het ingeven van een dimona aangifte raadpleeg de website van de sociale zekerheid",
      image: image5,
    },
    {
      id: 5,
      heading: "",
      description:
        "Voor al uw vragen rond belastingen en aangiften voor de belastingen",
      image: image6,
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
          <div className="row">
            <div className="col-lg-6 col-md-12 col-sm-12">
              <h3>{section.heading}</h3>
              <p>{section.description}</p>
            </div>
            <div className="col-lg-6 col-md-12 col-sm-12">
              <figure className="image" style={{ marginTop: "20px" }}>
                <Image
                  width={600}
                  height={400}
                  src={section.image}
                  alt={section.heading}
                  style={{ width: "100%", height: "auto", borderRadius: "8px" }}
                />
              </figure>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default WetgevingContent;
