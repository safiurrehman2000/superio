import { db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useCreateJobPost = async (payload) => {
  try {
    await addDoc(collection(db, "jobs"), payload);
    successToast("Job Created Successfully");
    return { success: true };
  } catch (error) {
    console.log("error :>> ", error);
    errorToast("Couldn't create job post");
    return { success: false };
  }
};

export const useGetJobListing = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, "jobs");
        const jobsSnap = await getDocs(jobsRef);

        const jobs = jobsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(jobs);
      } catch (err) {
        setError(err);
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return { data, loading, error };
};

export const useGetJobById = (jobId) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      setError(null);

      try {
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          setJob({
            id: jobSnap.id,
            ...jobSnap.data(),
          });
        } else {
          throw new Error("Job not found");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    } else {
      setLoading(false);
      setJob(null);
    }
  }, [jobId]);

  return { job, loading, error };
};
