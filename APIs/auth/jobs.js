import { addAppliedJob, setAppliedJobs } from "@/slices/userSlice";
import { db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useCreateJobPost = async (payload) => {
  try {
    await addDoc(collection(db, "jobs"), payload);
    successToast("Job Created Successfully");
    return { success: true };
  } catch (error) {
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

export const useApplyForJob = async (
  candidateId,
  selectedResume,
  jobId,
  message,
  appliedJobs,
  dispatch
) => {
  try {
    if (!candidateId) throw new Error("You must be logged in to apply.");

    await isAlreadyApplied(candidateId, jobId, appliedJobs);

    await addDoc(collection(db, "applications"), {
      candidateId,
      jobId,
      resume: selectedResume,
      message: message || "",
      appliedAt: Date.now(),
    });

    dispatch(addAppliedJob(jobId));

    successToast("Application submitted successfully!");
    return { success: true };
  } catch (err) {
    errorToast(err.message);
    return { success: false };
  }
};

export const isAlreadyApplied = async (candidateId, jobId, appliedJobs) => {
  if (appliedJobs.includes(jobId)) {
    throw new Error("You have already applied to this job.");
  }

  const applicationsQuery = query(
    collection(db, "applications"),
    where("candidateId", "==", candidateId),
    where("jobId", "==", jobId)
  );
  const querySnapshot = await getDocs(applicationsQuery);

  if (!querySnapshot.empty) {
    throw new Error("You have already applied to this job.");
  }
};

export const useGetAppliedJobs = async (candidateId, dispatch) => {
  try {
    if (!candidateId) return;

    const applicationsQuery = query(
      collection(db, "applications"),
      where("candidateId", "==", candidateId)
    );
    const querySnapshot = await getDocs(applicationsQuery);
    const appliedJobIds = querySnapshot.docs.map((doc) => doc.data().jobId);
    dispatch(setAppliedJobs(appliedJobIds));
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
  }
};
