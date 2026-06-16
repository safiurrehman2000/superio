"use client";

import { useGetUserById } from "@/APIs/auth/database";
import { formatString } from "@/utils/constants";
import { useEffect } from "react";

const CompanyInfo = ({ logoFn, companyId, companyData = null }) => {
  const shouldFetch = Boolean(companyId && !companyData);
  const { data: fetchedData, loading, error } = useGetUserById(
    shouldFetch ? companyId : null,
  );
  const data = companyData || fetchedData;

  useEffect(() => {
    if (data?.logo) {
      logoFn(data.logo);
    }
  }, [data, logoFn]);

  if (!companyData && loading) return <div>Loading company info...</div>;
  if (!companyData && error) return null;
  if (!data) return null;

  const primaryIndustry = data?.company_type?.[0]?.value
    ? formatString(data.company_type[0].value)
    : "Not specified";

  return (
    <ul className="company-info">
      <li>
        Primary industry: <span>{primaryIndustry}</span>
      </li>
    </ul>
  );
};

export default CompanyInfo;
