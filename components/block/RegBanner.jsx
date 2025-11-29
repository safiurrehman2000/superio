import Image from "next/image";
import Link from "next/link";

const RegBanner = () => {
  const regBannerContent = [
    {
      id: 1,
      bgImage: `url("/images/index-13/banner/bg-1.png")`,
      name: "Nieuwe Flexijobbers inzetten daar hoort natuurlijk ook loonadministratie bij !",
      text: ` Time is money ook bij loonadministratie.
        Het kan altijd beter, efficiënter, vlotter, eenvoudiger maar vooral goedkoper.
        Ga jij flexi's in dienst nemen ?

      Wil jij graag een vrijblijvende vergelijking ?`,
      avatar: "/images/resource/employ.png",
      bannerClass: "banner-style-one",
      width: "221",
      height: "281",
    },
    {
      id: 2,
      bgImage: `url("/images/index-13/banner/bg-2.png")`,
      name: "Waarom kiezen voor ons platform De flexiJobber als werkgever ?",
      text: ` Wist je dat 70 procent van alle sollicitanten een vacature zoekt en vindt via de zoekfunctie van Google?
Via de Flexijobber vergroot je jouw bereik!`,
      avatar: "/images/resource/candidate.png",
      bannerClass: "banner-style-two dark",
      width: "207",
      height: "283",
    },
  ];
  return (
    <>
      {regBannerContent.map((item) => (
        <div
          className={`${item.bannerClass} -type-2 col-lg-6 col-md-12 col-sm-12`}
          key={item.id}
        >
          <div
            className="inner-box"
            style={{
              backgroundImage: item.bgImage,
            }}
          >
            <div className="content">
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <Link href="/register" className="theme-btn btn-style-five">
                Account Aanmaken
              </Link>
            </div>
            <figure className="image">
              <Image
                width={item.width}
                height={item.height}
                src={item.avatar}
                alt="resource"
              />
            </figure>
          </div>
        </div>
      ))}
    </>
  );
};

export default RegBanner;
