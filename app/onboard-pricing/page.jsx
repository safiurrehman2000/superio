"use client";
import { getPricingPackages } from "@/APIs/pricing/pricing";
import BreadCrumb from "@/components/dashboard-pages/BreadCrumb";
import { LOGO } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);
const Pricing = () => {
  const [pricingContent, setPricingContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const handleSubmit = async (priceId) => {
    const stripe = await stripePromise;
    const { sessionId } = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId }),
    }).then((res) => res.json());

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error);
    }
  };
  useEffect(() => {
    const fetchPricingPackages = async () => {
      try {
        setLoading(true);

        const result = await getPricingPackages();

        if (result.success) {
          if (result.data && result.data.length > 0) {
            console.log("Setting pricing content:", result.data);
            setPricingContent(result.data);
          } else {
            console.log("No pricing packages found in database");
            setPricingContent([]);
          }
        } else {
          console.warn("Failed to fetch from database:", result.error);
          setPricingContent([]);
        }
      } catch (err) {
        console.error("Error fetching pricing packages:", err);
        setError(err.message);
        setPricingContent([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPackages();
  }, []);

  // Simple function to upload pricing data to database
  // const uploadPricingToDB = async () => {
  //   try {
  //     setInitMessage("Uploading pricing data...");

  //     // Check if data already exists
  //     const packagesRef = collection(db, "pricingPackages");
  //     const existingPackages = await getDocs(packagesRef);

  //     if (!existingPackages.empty) {
  //       setInitMessage("Pricing packages already exist in database!");
  //       return;
  //     }

  //     // Upload each package
  //     for (const packageData of fallbackPricing) {
  //       await addDoc(packagesRef, {
  //         ...packageData,
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //       });
  //     }

  //     setInitMessage("✅ Pricing packages uploaded successfully!");

  //     // Refresh the data
  //     const result = await getPricingPackages();
  //     if (result.success) {
  //       setPricingContent(result.data);
  //     }
  //   } catch (error) {
  //     console.error("Error uploading pricing data:", error);
  //     setInitMessage(`❌ Error: ${error.message}`);
  //   }
  // };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading pricing packages...</p>
      </div>
    );
  }

  if (error && pricingContent.length === 0) {
    return (
      <div className="error-container">
        <p>Error loading pricing packages. Please try again later.</p>
      </div>
    );
  }

  if (!loading && pricingContent.length === 0) {
    return (
      <div className="error-container">
        <p>No pricing packages found in database.</p>
        <p>Please check your Firebase database or upload pricing data.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        margin: "50px",
      }}
    >
      <header className="header-shaddow">
        <div className="container-fluid">
          <div className="main-box">
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
            </div>
          </div>
        </div>
      </header>
      <BreadCrumb title="Pricing Packages" />
      <p>Please select a package to continue</p>

      {/* Button to initialize pricing */}
      {/* <div style={{ marginBottom: "20px" }}>
        <button
          onClick={uploadPricingToDB}
          className="theme-btn btn-style-three"
          style={{ marginRight: "10px" }}
        >
          Upload Pricing to Database
        </button>
        {initMessage && (
          <p
            style={{
              color: initMessage.includes("Error") ? "red" : "green",
              marginTop: "10px",
            }}
          >
            {initMessage}
          </p>
        )}
      </div> */}

      <div className="pricing-tabs tabs-box wow fadeInUp">
        <div className="row">
          {pricingContent.map((item) => (
            <div
              className={`pricing-table col-lg-4 col-md-6 col-sm-12 ${item.tag}`}
              key={item.id}
            >
              <div className="inner-box">
                {item.tag ? <span className="tag">Recommended</span> : ""}
                <div className="title">{item.packageType}</div>
                {item?.price === "Free" ? (
                  <div className="price">{item.price}</div>
                ) : (
                  <div className="price">
                    ${item.price} <span className="duration">/ monthly</span>
                  </div>
                )}

                <div className="table-content">
                  <ul>
                    {item.features.map((feature, i) => (
                      <li key={i}>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ width: "100%" }}>
                  <button
                    className="theme-btn btn-style-three"
                    style={{ margin: "auto" }}
                    onClick={() => {
                      handleSubmit(item?.stripePriceId);
                    }}
                  >
                    Buy
                  </button>
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
