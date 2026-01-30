import Link from "next/link";
import Social from "./Social";

const CopyrightFooter = () => {
  return (
    <div className="footer-bottom">
      <div className="auto-container">
        <div className="outer-box">
          <div className="copyright-text">
            © {new Date().getFullYear()} De Flexijobber. Alle rechten
            voorbehouden.{" "}
            <span className="footer-legal-links">
              |{" "}
              <Link href="/algemene-voorwaarden">
                Algemene voorwaarden
              </Link>{" "}
              |{" "}
              <Link href="/cookie-beleid">
                Cookiebeleid
              </Link>{" "}
              |{" "}
              <Link href="/privacyverklaring">
                Privacyverklaring
              </Link>
            </span>
          </div>

          <div className="social-links">
            <Social />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopyrightFooter;
