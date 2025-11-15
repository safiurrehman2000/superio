"use client";
import StructuredData from "@/components/common/StructuredData";
import { generateJobPostingSchema } from "@/utils/seo-utils";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://flexijobber.be";

const JobStructuredData = ({ job }) => {
  if (!job) return null;

  const jobSchema = generateJobPostingSchema(job);
  const jobUrl = `${siteUrl}/job-list/${job.id}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Vacatures",
        item: `${siteUrl}/job-list`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: job.title || "Job Details",
        item: jobUrl,
      },
    ],
  };

  return (
    <>
      {jobSchema && <StructuredData data={jobSchema} />}
      <StructuredData data={breadcrumbSchema} />
    </>
  );
};

export default JobStructuredData;
