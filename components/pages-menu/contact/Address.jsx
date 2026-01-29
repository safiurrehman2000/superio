import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Address = () => {
  const addressContent = [
    {
      id: 1,
      icon: <FaWhatsapp />,
      title: "WhatsApp (Werkgevers)",
      text: "+32 479 29 42 76",
      href: "https://wa.me/32479294276",
      color: "whatsapp",
    },
    {
      id: 2,
      icon: <FaWhatsapp />,
      title: "WhatsApp (Vragen)",
      text: "+32 491 10 01 43",
      href: "https://wa.me/32491100143",
      color: "whatsapp",
    },
    {
      id: 3,
      icon: <FaPhoneAlt />,
      title: "Bel ons",
      text: "+32 491 10 01 43",
      href: "tel:+32491100143",
      color: "phone",
    },
    {
      id: 4,
      icon: <FaEnvelope />,
      title: "E-mail",
      text: "info@de-flexi-jobber.be",
      href: "mailto:info@de-flexi-jobber.be",
      color: "email",
    },
  ];

  return (
    <>
      {addressContent.map((item) => (
        <div
          key={item.id}
          className="contact-block col-xl-3 col-lg-3 col-md-6 col-sm-12"
        >
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inner-box text-center contact-link"
          >
            <span className={`icon-badge ${item.color}`}>
              {item.icon}
            </span>

            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </a>
        </div>
      ))}
    </>
  );
};

export default Address