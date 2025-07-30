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
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  orderBy,
  limit,
} from "firebase/firestore";
import { useEffect, useState, useRef } from "react";

export const useCreateJobPost = async (payload) => {
  try {
    const docRef = await addDoc(collection(db, "jobs"), payload);
    const jobData = {
      id: docRef.id,
      ...payload,
    };
    successToast("Job Created Successfully");
    return { success: true, job: jobData };
  } catch (error) {
    errorToast("Couldn't create job post");
    return { success: false, error: error.message };
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
  // Validate required parameters
  if (!candidateId) {
    throw new Error("Candidate ID is required");
  }

  if (!jobId) {
    throw new Error("Job ID is required");
  }

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
    // Validate employerId before making the query
    if (!employerId) {
      console.warn("useGetCompanyJobListings: employerId is undefined or null");
      return { jobs: [] };
    }

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
    // Validate required parameters
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!jobId) {
      throw new Error("Job ID is required");
    }

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
    // Validate required parameters
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!jobId) {
      throw new Error("Job ID is required");
    }

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
    // Validate employerId before making the query
    if (!employerId) {
      console.warn("useFetchEmployerJobs: employerId is undefined or null");
      return [];
    }

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

export const useFetchApplications = (employerId, selectedJobId, refreshKey) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        // Validate employerId before making any queries
        if (!employerId) {
          console.warn("useFetchApplications: employerId is undefined or null");
          setApplications([]);
          setLoading(false);
          return;
        }

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

          // Check if jobIds is empty before using whereIn
          if (jobIds.length === 0) {
            setApplications([]);
            setLoading(false);
            return;
          }

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
  }, [selectedJobId, employerId, refreshKey]);

  return { applications, loading };
};

export const updateApplicationStatus = async (applicationId, newStatus) => {
  try {
    const applicationRef = doc(db, "applications", applicationId);
    await updateDoc(applicationRef, {
      status: newStatus,
      updatedAt: Date.now(),
    });
    successToast("Application status updated");
    return { success: true };
  } catch (error) {
    errorToast("Couldn't change application status, please try again");
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
};

export const createJobAlert = async (
  userId,
  frequency,
  categories = [],
  locations = []
) => {
  try {
    if (!userId) {
      errorToast("You need to login as a candidate to create job alerts");
      return;
    }
    const userDoc = await getDoc(doc(db, "users", userId));
    if (!userDoc.exists() || userDoc.data().userType !== "Candidate") {
      errorToast("Only candidates can create job alerts.");
      return;
    }
    const alertRef = await addDoc(collection(db, `users/${userId}/jobAlerts`), {
      frequency,
      categories,
      locations,
      createdAt: Timestamp.now(),
      status: "active",
    });
    return { id: alertRef.id, success: true };
  } catch (error) {
    console.error("Error creating job alert:", error);
    errorToast("Error creating job alert:", error);
    return { success: false, error: error.message };
  }
};

export const deleteJob = async (jobId, employerId) => {
  try {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    if (!employerId) {
      throw new Error("Employer ID is required");
    }

    // Verify the user is an employer
    const userDoc = await getDoc(doc(db, "users", employerId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userData = userDoc.data();
    if (userData.userType !== "Employer" && userData.userType !== "Admin") {
      throw new Error("Only employers or admins can delete job postings");
    }

    // Verify the job exists and belongs to the employer
    const jobRef = doc(db, "jobs", jobId);
    const jobDoc = await getDoc(jobRef);

    if (!jobDoc.exists()) {
      throw new Error("Job not found");
    }

    const jobData = jobDoc.data();
    // If user is Employer, ensure they own the job. Admins can delete any job.
    if (userData.userType === "Employer" && jobData.employerId !== employerId) {
      throw new Error("You can only delete your own job postings");
    }

    // Start batch operations for atomic deletion
    const batch = writeBatch(db);

    // 1. Delete all applications for this job
    const applicationsQuery = query(
      collection(db, "applications"),
      where("jobId", "==", jobId)
    );
    const applicationsSnapshot = await getDocs(applicationsQuery);
    applicationsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 2. Delete all saved job entries for this job
    const savedJobsQuery = query(
      collection(db, "saved_jobs"),
      where("jobId", "==", jobId)
    );
    const savedJobsSnapshot = await getDocs(savedJobsQuery);
    savedJobsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. Delete all job view records for this job
    const jobViewsQuery = query(collection(db, `jobViews/${jobId}/views`));
    const jobViewsSnapshot = await getDocs(jobViewsQuery);
    jobViewsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 4. Delete the job document itself
    batch.delete(jobRef);

    // Execute all deletions in a single batch
    await batch.commit();

    successToast("Job and all related data deleted successfully");
    return {
      success: true,
      deletedCount: {
        applications: applicationsSnapshot.size,
        savedJobs: savedJobsSnapshot.size,
        jobViews: jobViewsSnapshot.size,
      },
    };
  } catch (error) {
    console.error("Error deleting job:", error);
    errorToast(error.message || "Failed to delete job");
    return { success: false, error: error.message };
  }
};

export const updateJob = async (jobId, updateData) => {
  try {
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("Update data is required");
    }

    // Verify the job exists
    const jobRef = doc(db, "jobs", jobId);
    const jobDoc = await getDoc(jobRef);

    if (!jobDoc.exists()) {
      throw new Error("Job not found");
    }

    // Prepare the update data with timestamp
    const updatePayload = {
      ...updateData,
      updatedAt: Date.now(),
    };

    // Update the job document
    await updateDoc(jobRef, updatePayload);

    successToast("Job updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating job:", error);
    errorToast(error.message || "Failed to update job");
    return { success: false, error: error.message };
  }
};

export const fetchJobViews = async (selectedJob) => {
  const viewsRef = collection(db, `jobViews/${selectedJob}/views`);
  const snapshot = await getDocs(viewsRef);
  const monthMap = {};
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.timestamp) {
      const month = getMonthYear(data.timestamp);
      monthMap[month] = (monthMap[month] || 0) + 1;
    }
  });
  const sortedMonths = Object.keys(monthMap).sort((a, b) => {
    const [ma, ya] = a.split(" ");
    const [mb, yb] = b.split(" ");
    return new Date(`${ma} 1, ${ya}`) - new Date(`${mb} 1, ${yb}`);
  });
  return {
    labels: sortedMonths,
    viewCounts: sortedMonths.map((m) => monthMap[m]),
  };
};

export const useGetJobListingPaginated = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const {
    page = 1,
    limit: itemsPerPage = 20,
    search = "",
    location = "",
    category = "",
    jobType = "",
    datePosted = "",
    sortOrder = "",
    status = "active",
  } = params;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query constraints
        let constraints = [];

        // Filter by status (exclude archived jobs)
        if (status) {
          constraints.push(where("status", "!=", "archived"));
        }

        // Apply sorting
        if (sortOrder === "asc") {
          constraints.push(orderBy("createdAt", "asc"));
        } else if (sortOrder === "desc") {
          constraints.push(orderBy("createdAt", "desc"));
        } else {
          // Default sorting by creation date (newest first)
          constraints.push(orderBy("createdAt", "desc"));
        }

        // Apply pagination
        const offset = (page - 1) * itemsPerPage;
        // Get all documents up to offset + itemsPerPage (Firestore limitation)
        constraints.push(limit(offset + itemsPerPage));

        // Create the query
        const jobsRef = collection(db, "jobs");
        const jobsQuery = query(jobsRef, ...constraints);
        const jobsSnap = await getDocs(jobsQuery);

        let jobs = jobsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Apply offset in memory (Firestore limitation)
        if (offset > 0) {
          jobs = jobs.slice(offset);
        }

        // Apply client-side filters
        if (search) {
          jobs = jobs.filter(
            (job) =>
              job.title?.toLowerCase().includes(search.toLowerCase()) ||
              job.description?.toLowerCase().includes(search.toLowerCase()) ||
              job.companyName?.toLowerCase().includes(search.toLowerCase())
          );
        }

        if (location) {
          jobs = jobs.filter((job) =>
            job.location?.toLowerCase().includes(location.toLowerCase())
          );
        }

        if (category) {
          jobs = jobs.filter((job) => job.category === category);
        }

        if (jobType) {
          jobs = jobs.filter((job) => job.jobType === jobType);
        }

        if (datePosted) {
          const now = new Date();
          let filterDate;

          switch (datePosted) {
            case "today":
              filterDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
              );
              break;
            case "week":
              filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "month":
              filterDate = new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                now.getDate()
              );
              break;
            default:
              filterDate = null;
          }

          if (filterDate) {
            jobs = jobs.filter((job) => {
              const jobDate = new Date(job.createdAt);
              return jobDate >= filterDate;
            });
          }
        }

        // Get total count for pagination
        const totalQuery = query(
          collection(db, "jobs"),
          where("status", "!=", "archived")
        );
        const totalSnap = await getDocs(totalQuery);
        const totalCount = totalSnap.docs.length;

        setData(jobs);
        setTotalItems(totalCount);
      } catch (err) {
        setError(err);
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [
    page,
    itemsPerPage,
    search,
    location,
    category,
    jobType,
    datePosted,
    sortOrder,
    status,
  ]);

  return {
    data,
    loading,
    error,
    totalItems,
    totalPages: Math.ceil(totalItems / itemsPerPage),
    currentPage: page,
  };
};
