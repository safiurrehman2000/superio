import { auth, db } from "@/utils/firebase";
import { resumeToFile } from "@/utils/resumeHelperFunctions";
import { errorToast, successToast } from "@/utils/toast";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useGetUploadedResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      const user = auth.currentUser;
      if (!user?.uid) {
        setError("Please login first to view resumes");
        errorToast("Please login first to view resumes");
        return;
      }

      setLoading(true);
      try {
        const resumesSnapshot = await getDocs(
          collection(db, "users", user.uid, "resumes")
        );
        const resumeData = resumesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const files = resumeData.map(resumeToFile);
        setResumes(files);
        successToast("Resumes fetched successfully");
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Failed to load resumes. Please try again.");
        errorToast("Failed to load resumes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, []);

  return { resumes, loading, error };
};
