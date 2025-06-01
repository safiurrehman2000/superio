"use client";
import { addAppliedJob, setAppliedJobs } from "@/slices/userSlice";
import { db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";

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
      resumeId: selectedResume?.id,
      message: message || "",
      appliedAt: Date.now(),
      status: "Active",
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

    // Fetch applied job IDs
    const applicationsQuery = query(
      collection(db, "applications"),
      where("candidateId", "==", candidateId)
    );
    const querySnapshot = await getDocs(applicationsQuery);
    const applications = querySnapshot.docs.map((doc) => ({
      jobId: doc.data().jobId,
      appliedAt: doc.data().appliedAt,
      status: doc.data().status,
    }));

    // Fetch job details for each job ID
    const jobDetailsPromises = applications.map(
      async ({ jobId, appliedAt }) => {
        const jobDocRef = doc(db, "jobs", jobId);
        const jobDocSnap = await getDoc(jobDocRef);
        if (jobDocSnap.exists()) {
          return { id: jobId, appliedAt, status, ...jobDocSnap.data() };
        }
        return null;
      }
    );

    const jobDetails = (await Promise.all(jobDetailsPromises)).filter(
      (job) => job !== null
    );

    dispatch(setAppliedJobs(jobDetails));
  } catch (err) {
    console.error("Failed to fetch applied jobs:", err);
  }
};

export const useGetCompanyJobListings = async (employerId) => {
  try {
    const jobsRef = collection(db, "jobs");

    const q = query(jobsRef, where("employerId", "==", employerId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { jobs: [] };
    }

    const jobs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { jobs };
  } catch (error) {
    console.error("Error getting employer jobs:", error);
    throw error;
  }
};

export const useSaveJob = async (userId, jobId) => {
  try {
    // First check if the job is already saved
    const q = query(
      collection(db, "saved_jobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Job already saved - return the existing document
      const doc = querySnapshot.docs[0];
      return { id: doc.id, jobId, ...doc.data() };
    }

    // If not saved, create new bookmark
    const savedJob = {
      userId,
      jobId,
      savedAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "saved_jobs"), savedJob);
    successToast("Job Saved Successfully");
    return { id: docRef.id, jobId, ...savedJob };
  } catch (error) {
    console.error("Error saving job:", error);
    errorToast("Failed to save Job, Please try again");
    throw error;
  }
};

export const useUnsaveJob = async (userId, jobId) => {
  try {
    const q = query(
      collection(db, "saved_jobs"),
      where("userId", "==", userId),
      where("jobId", "==", jobId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return true;
    }

    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, "saved_jobs", docSnapshot.id))
    );

    await Promise.all(deletePromises);
    successToast("Successfully unsaved job");
    return true;
  } catch (error) {
    console.error("Error unsaving job:", error);
    errorToast("Error unsaving job");
    throw error;
  }
};

export const useGetSavedJobs = async (userId) => {
  try {
    if (!userId) return [];

    const q = query(
      collection(db, "saved_jobs"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    const savedJobs = [];
    const promises = [];

    for (const docSnapshot of querySnapshot.docs) {
      const savedJob = docSnapshot.data();
      promises.push(
        getDoc(doc(db, "jobs", savedJob.jobId)).then((jobDoc) => {
          if (jobDoc.exists()) {
            savedJobs.push({
              id: docSnapshot.id,
              jobId: savedJob.jobId,
              ...jobDoc.data(),
              savedAt: savedJob.savedAt,
            });
          }
        })
      );
    }

    await Promise.all(promises);
    return savedJobs;
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    throw error;
  }
};

export const useJobViewIncrement = (jobId, user) => {
  const isTracking = useRef(false);

  useEffect(() => {
    if (!user || !jobId || user.userType !== "Candidate") return;
    const trackJobView = async () => {
      if (isTracking?.current) return;
      isTracking.current = true;

      try {
        // Check session storage
        const sessionKey = `viewed_${user.uid}_${jobId}`;
        if (sessionStorage.getItem(sessionKey)) return;

        // Check Firestore for existing view
        const viewDocRef = doc(db, `jobViews/${jobId}/views`, user.uid);
        const viewDoc = await getDoc(viewDocRef);
        if (viewDoc.exists()) return;

        console.log("trackJobView is being called :>> ");

        const jobRef = doc(db, "jobs", jobId);
        // Increment viewCount
        await updateDoc(jobRef, { viewCount: increment(1) });
        // Record view in jobViews subcollection, creating jobViews if needed
        await setDoc(viewDocRef, { userId: user.uid, timestamp: Date.now() });
        sessionStorage.setItem(sessionKey, "true");
        console.log(`View count incremented for job ${jobId}`);
      } catch (error) {
        console.error("Error incrementing view count:", error);
      } finally {
        isTracking.current = false; // Reset tracking flag
      }
    };

    trackJobView();
  }, [jobId, user]); // Correct dependencies
};

export const useFetchEmployerJobs = async (employerId) => {
  try {
    const jobsRef = collection(db, "jobs");
    const q = query(jobsRef, where("employerId", "==", employerId));
    const querySnapshot = await getDocs(q);

    const jobs = [];
    querySnapshot.forEach((doc) => {
      jobs.push({ id: doc.id, ...doc.data() }); // Include the job ID and data
    });

    return jobs; // Returns an array of jobs
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const useFetchApplications = (employerId, selectedJobId) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        let applicationsQuery;

        if (selectedJobId) {
          // Fetch applications for the selected job
          applicationsQuery = query(
            collection(db, "applications"),
            where("jobId", "==", selectedJobId)
          );
        } else {
          // First fetch all jobs for this employer
          const jobsQuery = query(
            collection(db, "jobs"),
            where("employerId", "==", employerId)
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobIds = jobsSnapshot.docs.map((doc) => doc.id);

          // Then fetch all applications for these job IDs
          applicationsQuery = query(
            collection(db, "applications"),
            where("jobId", "in", jobIds)
          );
        }

        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch candidate and resume details for each application
        const applicationsWithDetails = await Promise.all(
          applicationsData.map(async (app) => {
            // Fetch candidate document
            const candidateDocRef = doc(db, "users", app.candidateId);
            const candidateSnapshot = await getDoc(candidateDocRef);
            const candidateData = candidateSnapshot.exists()
              ? candidateSnapshot.data()
              : null;

            // Fetch resume document from user's resumes subcollection
            let resumeData = {};
            if (app.resumeId) {
              const resumeDocRef = doc(
                db,
                "users",
                app.candidateId,
                "resumes",
                app.resumeId
              );
              const resumeSnapshot = await getDoc(resumeDocRef);
              if (resumeSnapshot.exists()) {
                resumeData = resumeSnapshot.data();
                // Convert Base64 fileData to data URL for PDF
                if (resumeData.fileData) {
                  resumeData.url = `data:application/pdf;base64,${resumeData.fileData}`;
                }
              }
            }

            return {
              ...app,
              candidate:
                candidateData && candidateData.userType === "Candidate"
                  ? candidateData
                  : {},
              resume: resumeData,
            };
          })
        );

        setApplications(applicationsWithDetails);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (employerId) {
      fetchApplications();
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [selectedJobId, employerId]);

  return { applications, loading };
};

export const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    const applicationRef = doc(db, "applications", applicationId);
    await updateDoc(applicationRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
    console.log(`Application ${applicationId} updated to ${newStatus}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
};
