import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import Link from "next/link";
import { LOGO } from "@/utils/constants";
import Image from "next/image";

const Pricing = () => {
  const pricingCotent = [
    {
      id: 1,
      packageType: "Basic",
      price: "199",
      tag: "",
      features: [
        "30 job posting",
        "3 featured job",
        "Job displayed for 15 days",
        "Premium Support 24/7",
      ],
    },
    {
      id: 2,
      packageType: "Standard",
      price: "499",
      tag: "tagged",
      features: [
        "40 job posting",
        "5 featured job",
        "Job displayed for 20 days",
        "Premium Support 24/7",
      ],
    },
    {
      id: 3,
      packageType: "Extended",
      price: "799",
      tag: "",
      features: [
        "50 job posting",
        "10 featured job",
        "Job displayed for 60 days",
        "Premium Support 24/7",
      ],
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <header className={`header-shaddow }`}>
        <div className="container-fluid">
          {/* <!-- Main box --> */}
          <div className="main-box">
            {/* <!--Nav Outer --> */}
            <div className="nav-outer">
              <div className="logo-box">
                <div className="logo text-center">
                  <Image
                    alt="brand"
                    src={LOGO}
                    width={154}
                    height={50}
                    priority
                  />
                </div>
              </div>
              {/* End .logo-box */}

              {/* <!-- Main Menu End--> */}
            </div>
            {/* End .nav-outer */}

            {/* End outer-box */}
          </div>
        </div>
      </header>{" "}
      <BreadCrumb title="Pricing Packages" />
      <p>Please select a package to continue</p>
      <div className="pricing-tabs tabs-box wow fadeInUp">
        {/* <!--Tabs Container--> */}
        <div className="row">
          {pricingCotent.map((item) => (
            <div
              className={`pricing-table col-lg-4 col-md-6 col-sm-12 ${item.tag}`}
              key={item.id}
            >
              <div className="inner-box">
                {item.tag ? (
                  <>
                    <span className="tag">Recommended</span>
                  </>
                ) : (
                  ""
                )}

                <div className="title">{item.packageType}</div>
                <div className="price">
                  ${item.price} <span className="duration">/ monthly</span>
                </div>
                <div className="table-content">
                  <ul>
                    {item.features.map((feature, i) => (
                      <li key={i}>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="table-footer">
                  <Link
                    href="/onboard-cart"
                    className="theme-btn btn-style-three"
                  >
                    Add to Cart
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
