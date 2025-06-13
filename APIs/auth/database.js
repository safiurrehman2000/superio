import { auth, db } from "@/utils/firebase";
import { errorToast, successToast } from "@/utils/toast";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const useUpdateIsFirstTime = async (id) => {
  try {
    await setDoc(doc(db, "users", id), { isFirstTime: false }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
    };
  }
};

export const useUpdateUserInfo = () => {
  const updateUserInfo = async (payload, userId, userType) => {
    try {
      // Validate inputs
      if (!payload || !userId) {
        throw new Error("Payload or user ID is missing");
      }

      let updateData = { ...payload };

      // Handle logo as base64
      if (payload.logo && payload.logo instanceof File) {
        const base64Logo = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read logo file"));
          reader.readAsDataURL(payload.logo);
        });
        updateData.logo = base64Logo; // Store base64 string
      } else if (payload.logo === null) {
        updateData.logo = null; // Clear logo if removed
      }

      // Update user document
      const userRef = doc(db, "users", userId);
      await setDoc(
        userRef,
        {
          ...updateData,
          userType,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      successToast("User info updated successfully");
      return { success: true, message: "User info updated successfully" };
    } catch (error) {
      errorToast("Error updating user info" + "" + error);
      console.error("Error updating user info:", error);
      throw new Error(error.message || "Failed to update user info");
    }
  };

  return { updateUserInfo };
};

export const useGetUserById = (userId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) {
          throw new Error("User ID is required");
        }

        setLoading(true);
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          throw new Error(`User with ID ${userId} not found`);
        }

        setData({
          id: userSnap.id,
          ...userSnap.data(),
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { data, loading, error };
};

export const reauthenticateUser = async (email, password, setLoading) => {
  try {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) {
      errorToast("No user found! Please try again");
      return;
    }
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    return { success: true };
  } catch (error) {
    console.log("error :>> ", error);
    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password"
    ) {
      errorToast("Your password is wrong");
    } else {
      errorToast("Something went wrong, please try again");
    }
    return { success: false };
  } finally {
    setLoading(false);
  }
};

export const useDeleteUserAccount = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    // First delete the resume subcollection
    const resumeCollectionRef = collection(userDocRef, "resume");
    const resumeDocs = await getDocs(resumeCollectionRef);

    // Delete all documents in the resume subcollection
    const deleteResumePromises = resumeDocs.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deleteResumePromises);

    // Then delete the user document
    await deleteDoc(userDocRef);

    const user = auth.currentUser;
    if (user && user.uid === userId) {
      await deleteUser(user);
    } else {
      errorToast("Error deleting user, please try again");
    }
    successToast("User Successfully deleted");
  } catch (error) {
    errorToast("Error deleting user, please try again");
    console.error("Error deleting user:", error.message);
    throw error;
  }
};

export const useGetRecentApplications = (employerId) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // First get all jobs for this employer
        const jobsRef = collection(db, "jobs");
        const jobsQuery = query(jobsRef, where("employerId", "==", employerId));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobIds = jobsSnapshot.docs.map((doc) => doc.id);

        if (jobIds.length === 0) {
          setApplications([]);
          setLoading(false);
          return;
        }

        // Get all applications for these jobs
        const applicationsRef = collection(db, "applications");
        const applicationsQuery = query(
          applicationsRef,
          where("jobId", "in", jobIds)
        );

        // Set up real-time listener
        const unsubscribe = onSnapshot(applicationsQuery, async (snapshot) => {
          // Get all unique candidate IDs
          const candidateIds = [
            ...new Set(snapshot.docs.map((doc) => doc.data().candidateId)),
          ];

          // Get candidate details
          const candidatesRef = collection(db, "users");
          const candidatesQuery = query(
            candidatesRef,
            where("__name__", "in", candidateIds)
          );
          const candidatesSnapshot = await getDocs(candidatesQuery);
          const candidatesMap = {};
          candidatesSnapshot.docs.forEach((doc) => {
            candidatesMap[doc.id] = doc.data();
          });

          // Combine application data with candidate and job data
          const applications = snapshot.docs.map((doc) => {
            const application = doc.data();
            const candidate = candidatesMap[application.candidateId];
            const job = jobsSnapshot.docs
              .find((jobDoc) => jobDoc.id === application.jobId)
              ?.data();

            return {
              id: doc.id,
              candidateName:
                candidate?.name ||
                candidate?.email?.split("@")[0] ||
                "Anonymous",
              jobTitle: job?.title || "Unknown Job",
              appliedAt: application.appliedAt,
              status: application.status,
            };
          });

          // Sort by appliedAt in descending order and take first 6
          setApplications(
            applications.sort((a, b) => b.appliedAt - a.appliedAt).slice(0, 6)
          );
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching recent applications:", error);
        setApplications([]);
        setLoading(false);
      }
    };

    fetchData();
  }, [employerId]);

  return { applications, loading };
};

// Function to get total users count
export const getTotalUsersCount = (callback) => {
  const usersRef = collection(db, "users");
  return onSnapshot(usersRef, (snapshot) => {
    const totalUsers = snapshot.size;
    callback({ totalUsers });
  });
};

// Function to get employers (companies) count
export const getEmployersCount = (callback) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("userType", "==", "Employer"));

  return onSnapshot(q, (snapshot) => {
    const employersCount = snapshot.size;
    callback({ employersCount });
  });
};

// Function to get candidates count and their resumes
export const getCandidatesAndResumesCount = (callback) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("userType", "==", "Candidate"));

  return onSnapshot(q, async (snapshot) => {
    const candidatesCount = snapshot.size;
    let totalResumes = 0;

    // Get all candidates' resumes
    const candidates = snapshot.docs;
    for (const candidate of candidates) {
      const resumesRef = collection(db, "users", candidate.id, "resumes");
      const resumesSnapshot = await getDocs(resumesRef);
      totalResumes += resumesSnapshot.size;
    }

    callback({ candidatesCount, totalResumes });
  });
};

// Function to get all counts (users, companies, resumes)
export const getAllCounts = (callback) => {
  const usersRef = collection(db, "users");

  return onSnapshot(usersRef, async (snapshot) => {
    const totalUsers = snapshot.size;
    let employersCount = 0;
    let candidatesCount = 0;
    let totalResumes = 0;

    // Process each user
    const users = snapshot.docs;
    for (const user of users) {
      const userData = user.data();

      if (userData.userType === "Employer") {
        employersCount++;
      } else if (userData.userType === "Candidate") {
        candidatesCount++;
        // Get resumes for this candidate
        const resumesRef = collection(db, "users", user.id, "resumes");
        const resumesSnapshot = await getDocs(resumesRef);
        totalResumes += resumesSnapshot.size;
      }
    }

    callback({
      totalUsers,
      employersCount,
      candidatesCount,
      totalResumes,
    });
  });
};

// Function to update the Funfact2 component with real-time counts
export const subscribeToCounts = (callback) => {
  return getAllCounts((counts) => {
    const counterUpContent = [
      {
        id: 1,
        startCount: "0",
        endCount: counts.totalUsers.toString(),
        meta: "Users",
        animationDelay: "700",
      },
      {
        id: 2,
        startCount: "0",
        endCount: counts.employersCount.toString(),
        meta: "Companies",
        animationDelay: "800",
      },
      {
        id: 3,
        startCount: "0",
        endCount: counts.totalResumes.toString(),
        meta: "Resumes",
        animationDelay: "900",
      },
      {
        id: 4,
        startCount: "0",
        endCount: counts.candidatesCount.toString(),
        meta: "Candidates",
        animationDelay: "1000",
      },
    ];

    callback(counterUpContent);
  });
};
