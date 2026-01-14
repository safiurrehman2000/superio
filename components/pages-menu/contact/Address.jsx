import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Address = () => {
  const addressContent = [
    {
      id: 1,
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      text: (
        <>
          Plaats vacature via WhatsApp (werkgever)
          <br />
          <a href="https://wa.me/32479294276">+32 479 29 42 76</a>
        </>
      ),
    },
    {
      id: 2,
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      text: (
        <>
          WhatsApp bij vragen
          <br />
          <a href="https://wa.me/32491100143">+32 491 10 01 43</a>
        </>
      ),
    },
    {
      id: 3,
      icon: <FaPhoneAlt />,
      title: "Bel ons",
      text: (
        <>
          <a href="tel:+32491100143">+32 491 10 01 43</a>
        </>
      ),
    },
    {
      id: 4,
      icon: <FaEnvelope />,
      title: "E-mail",
      text: (
        <>
          <a href="mailto:info@de-flexi-jobber.be">
            info@de-flexi-jobber.be
          </a>
        </>
      ),
    },
  ];

  return (
    <>
      {addressContent.map((item) => (
        <div
          key={item.id}
          className="contact-block col-xl-3 col-lg-3 col-md-6 col-sm-12"
        >
          <div className="inner-box text-center">
            <span className="icon-badge">{item.icon}</span>
            <h4>{item.title}</h4>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default Address;



