import JobClient from "@/components/job/JobClient";
import JobStructuredData from "@/components/job/JobStructuredData";
import { getJobById } from "@/APIs/auth/jobs";

const siteUrl = "https://www.de-flexi-jobber.be";

export async function generateMetadata({ params }) {
  const job = await getJobById(params.id);

  if (!job) {
    return { title: "Vacature niet gevonden", robots: { index: false } };
  }

  return {
    title: `${job.title} – ${job.company} | De Flexi Jobber`,
    description: job.description?.slice(0, 160),
    alternates: {
      canonical: `${siteUrl}/job-list/${params.id}`,
    },
    openGraph: {
      title: `${job.title} – ${job.company}`,
      description: job.description?.slice(0, 160),
      url: `${siteUrl}/job-list/${params.id}`,
      siteName: "De Flexi Jobber",
      locale: "nl_BE",
      type: "article",
    },
  };
}

export default async function JobPage({ params }) {
  const job = await getJobById(params.id);

  if (!job) return <p>Vacature niet gevonden</p>;

  return (
    <>
      {/* 🔥 GOOGLE ZIET DIT */}
      <JobStructuredData job={job} />

      {/* 🔥 USER INTERACTIE */}
      <JobClient job={job} />
    </>
  );
}
