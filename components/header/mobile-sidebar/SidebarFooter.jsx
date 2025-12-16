const SidebarFooter = () => {
  const socialContent = [
    { id: 1, icon: "fa-facebook-f", link: "https://www.facebook.com/" },
    { id: 2, icon: "fa-twitter", link: "https://www.twitter.com/" },
    { id: 3, icon: "fa-instagram", link: "https://www.instagram.com/" },
    { id: 4, icon: "fa-linkedin-in", link: "https://www.linkedin.com/" },
  ];

  return (
    <div className="mm-add-listing mm-listitem pro-footer">
      <a
        href="/employers-dashboard/post-jobs"
        className="theme-btn btn-style-one mm-listitem__text"
      >
        Vacature Plaatsen
      </a>
      {/* job post btn */}

      <div className="mm-listitem__text">
        <div className="contact-info">
          <span className="phone-num">
            <span>Bel Ons</span>
            <a href="tel:+32491100143">+32 491 10 01 43</a>
          </span>
          <span className="address">Belgiëlei 129, 2018 Antwerpen</span>
          <a href="mailto:info@de-flexi-jobber.be" className="email">
            info@de-flexi-jobber.be
          </a>
          <span className="vat">BTW: BE 0655.845.308</span>
        </div>
        {/* End .contact-info */}

        <div className="social-links">
          {socialContent.map((item) => (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              key={item.id}
            >
              <i className={`fab ${item.icon}`}></i>
            </a>
          ))}
        </div>
        {/* End social-links */}
      </div>
      {/* End .mm-listitem__text */}
    </div>
  );
};

export default SidebarFooter;
