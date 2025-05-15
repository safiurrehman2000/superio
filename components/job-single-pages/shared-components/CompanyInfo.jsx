"use client";

import { useGetUserById } from "@/APIs/auth/database";
import { formatString } from "@/utils/constants";
import { useEffect } from "react";

const CompanyInfo = ({ logoFn, companyId }) => {
  const { data, loading, error } = useGetUserById(companyId);

  useEffect(() => {
    if (data?.logo) {
      logoFn(data.logo); // Pass logo to parent
    }
  }, [data, logoFn]);

  if (loading) return <div>Loading company info...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No company data found</div>;

  return (
    <ul className="company-info">
      <li>
        Primary industry:{" "}
        <span>{formatString(data.company_type[0]?.value)}</span>
      </li>
      <li>
        Phone: <span>{data?.phone}</span>
      </li>
      <li>
        Email: <span>{data?.email}</span>
      </li>
      <li>
        Location: <span>{formatString(data?.company_location)}</span>
      </li>
      {/* <li>
        Social media:
        <Social />
      </li> */}
    </ul>
  );
};

export default CompanyInfo;
