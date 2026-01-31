"use client";

import { useGetUserById } from "@/APIs/auth/database";
import { formatString } from "@/utils/constants";
import { useEffect } from "react";

const CompanyInfo = ({ logoFn, companyId }) => {
  const { data, loading, error } = useGetUserById(companyId);

  useEffect(() => {
    if (data?.logo) {
      logoFn(data.logo);
    }
  }, [data, logoFn]);

  if (loading) return <div>Loading company info...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No company data found</div>;

  // Fallback values
  const primaryIndustry = data?.company_type?.[0]?.value
    ? formatString(data.company_type[0].value)
    : "Not specified";

  const phone = data?.phone || "Not provided";
  const email = data?.email || "Not available";
  const location = data?.company_location
    ? formatString(data.company_location)
    : "Location not specified";

  return (
    <ul className="company-info">
      <li>
        Primary industry: <span>{primaryIndustry}</span>
      </li>
      <li>
        Location: <span>{location}</span>
      </li>
      {/* <li>
       Social media:
       <Social />
     </li> */}
    </ul>
  );
};

export default CompanyInfo;
