import { db } from "@/utils/firebase";
import { fileToBase64, resumeToFile } from "@/utils/resumeHelperFunctions";
import { errorToast, successToast } from "@/utils/toast";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUpdateIsFirstTime } from "./database";
import { useDispatch } from "react-redux";
import { addResume } from "@/slices/userSlice";

export const useGetUploadedResumes = (user) => {
  if (!user) {
    errorToast("User is not authenticated");
    return;
  }
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

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

export const useUploadResume = async (
  user,
  data,
  dispatch,
  setManager,
  setError
) => {
  const uploadedResumes = []; // Store resume data with Firestore IDs

  // Ensure data is an array
  if (!Array.isArray(data) || data.length === 0) {
    setError("No files provided for upload.");
    return { success: false, resumes: [] };
  }

  try {
    // Process each file in the data array
    for (const file of data) {
      // Validate file
      if (!(file instanceof File)) {
        console.warn(`Skipping invalid file: ${file}`);
        continue; // Skip invalid files but continue processing others
      }

      // Convert file to base64
      const base64Data = await fileToBase64(file);

      // Upload to Firestore and get document reference
      const docRef = await addDoc(
        collection(db, "users", user.uid, "resumes"),
        {
          fileName: file.name,
          fileData: base64Data,
          fileType: file.type,
          size: file.size,
          uploadedAt: new Date(),
        }
      );

      // Create resume object with Firestore document ID
      const resume = {
        id: docRef.id, // Firestore-generated ID
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      // Add to uploadedResumes for return value
      uploadedResumes.push(resume);

      // Dispatch to Redux store
      dispatch(addResume(resume));
    }

    // If no resumes were uploaded (e.g., all files were invalid)
    if (uploadedResumes.length === 0) {
      setError("No valid files were uploaded.");
      return { success: false, resumes: [] };
    }

    // Update isFirstTime status
    const { success: firstTimeSuccess } = await useUpdateIsFirstTime(user.uid);
    if (!firstTimeSuccess) {
      console.warn("Failed to update isFirstTime status");
    }

    // Update local state with raw file objects
    setManager((prev) => [...prev, ...data]);

    // Show success toast
    successToast(`${uploadedResumes.length} resume(s) uploaded successfully`);
    setError("");

    // Return success and uploaded resume data
    return { success: true, resumes: uploadedResumes };
  } catch (error) {
    console.error("Error uploading resumes:", error);
    setError("Failed to upload one or more resumes. Please try again.");
    return { success: false, resumes: uploadedResumes };
  }
};
