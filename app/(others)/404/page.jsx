import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Pagina niet gevonden || De Flexijobber",
  description: "De Flexijobber - Flexijobs",
};

const index = () => {
  return (
    <>
      <div
        className="error-page-wrapper "
        style={{
          backgroundImage: `url(/images/404.jpg)`,
        }}
        data-aos="fade"
      >
        <div className="content">
          <div className="logo">
            <Link href="/">
              <Image
                width={154}
                height={50}
                alt="De Flexijobber Logo"
                src="/images/logo-deflexijobber.png"
              />
            </Link>
          </div>
          {/* End logo */}

          <h1>404!</h1>
          <p>De pagina bestaat niet!</p>

          <Link className="theme-btn btn-style-three call-modal" href="/">
            TERUG NAAR HOME
          </Link>
        </div>
        {/* End .content */}
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(index), { ssr: false });
