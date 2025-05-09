import { auth, db } from "@/utils/firebase";
import { fileToBase64, resumeToFile } from "@/utils/resumeHelperFunctions";
import { errorToast, successToast } from "@/utils/toast";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUpdateIsFirstTime } from "./database";

export const useGetUploadedResumes = (user) => {
  if (!user) {
    errorToast("User is not authenticated");
    return;
  }
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to track component mount status

    const fetchResumes = async () => {
      if (!user?.uid) {
        if (isMounted) {
          setError("Please login first to view resumes");
          errorToast("Please login first to view resumes");
        }
        return;
      }

      if (isMounted) setLoading(true);

      try {
        const resumesSnapshot = await getDocs(
          collection(db, "users", user.uid, "resumes")
        );
        const resumeData = resumesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const files = resumeData.map(resumeToFile);

        if (files.length === 0) {
          return;
        }

        if (isMounted) {
          setResumes(files);
          successToast("Resumes fetched successfully");
        }
      } catch (error) {
        console.error("Error fetching resumes:", error);
        if (isMounted) {
          setError("Failed to load resumes. Please try again.");
          errorToast("Failed to load resumes. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResumes();

    return () => {
      isMounted = false; // Cleanup function to set flag false when unmounted
    };
  }, []);

  return { resumes, loading, error };
};

export const useUploadResume = async (user, data, setManager, setError) => {
  try {
    // Convert files to base64 and upload to Firestore
    for (const file of data) {
      const base64Data = await fileToBase64(file);
      await addDoc(collection(db, "users", user.uid, "resumes"), {
        fileName: file.name,
        fileData: base64Data,
        fileType: file.type,
        size: file.size,
        uploadedAt: new Date(),
      });
    }
    const { success } = await useUpdateIsFirstTime(user.uid);
    setManager((prev) => [...prev, ...data]);
    successToast("Resume uploaded successfully");
    setError("");

    return { success: true };
  } catch (error) {
    console.error("Error uploading resume:", error);
    setError("Failed to upload resume. Please try again.");
    return { success: false };
  }
};
