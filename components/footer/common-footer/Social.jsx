const Social = () => {
  return (
    <ul className="social-links-list">
      <li className="facebook">
        <a
          href="https://www.facebook.com/people/Flexi-jobber-Vlaanderen/61571515856408/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </a>
      </li>

      <li className="instagram">
        <a
          href="https://www.instagram.com/flexijobber.be/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <i className="fab fa-instagram"></i>
        </a>
      </li>

      <li className="linkedin">
        <a
          href="https://www.linkedin.com/company/de-flexi-jobber/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </a>
      </li>

      <li className="youtube">
        <a
          href="https://www.youtube.com/@de-flexijobber"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube"
        >
          <i className="fab fa-youtube"></i>
        </a>
      </li>
    </ul>
  );
};

export default Social;


