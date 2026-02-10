import JobClient from "@/components/job/JobClient";
import JobStructuredData from "@/components/job/JobStructuredData";
import { getJobByIdServer } from "@/lib/server/getJobByIdServer";

export const revalidate = 300; // ISR – 5 minuten

const siteUrl = "https://www.de-flexi-jobber.be";

function cleanDescription(text = "") {
  return text.replace(/<[^>]+>/g, "").slice(0, 160);
}

export async function generateMetadata({ params }) {
  const job = await getJobByIdServer(params.id);

  if (!job) {
    return {
      title: "Vacature niet gevonden",
      robots: { index: false, follow: false },
    };
  }

  const description = cleanDescription(job.description);

  return {
    title: `${job.title} – ${job.company} | De Flexi Jobber`,
    description,
    alternates: {
      canonical: `${siteUrl}/job-list/${params.id}`,
    },
    openGraph: {
      title: `${job.title} – ${job.company}`,
      description,
      url: `${siteUrl}/job-list/${params.id}`,
      siteName: "De Flexi Jobber",
      locale: "nl_BE",
      type: "article",
    },
  };
}

export default async function JobPage({ params }) {
  const job = await getJobByIdServer(params.id);

  if (!job) return <p>Vacature niet gevonden</p>;

  return (
    <>
      {/* 🔥 SEO / GOOGLE JOBS */}
      <JobStructuredData job={job} />

      {/* 🔥 INTERACTIE */}
      <JobClient job={job} />
    </>
  );
}
