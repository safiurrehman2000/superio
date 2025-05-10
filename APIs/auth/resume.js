import { db } from "@/utils/firebase";
import { fileToBase64, resumeToFile } from "@/utils/resumeHelperFunctions";
import { errorToast, successToast } from "@/utils/toast";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useUpdateIsFirstTime } from "./database";
import { useDispatch, useSelector } from "react-redux";
import { addResume, removeResumeById } from "@/slices/userSlice";

export const useGetUploadedResumes = (user) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  // Access the current resumes from the Redux store
  const storedResumes = useSelector((state) => state.user.resumes);

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

        // Map resumeData to include both Firestore ID and File object
        const resumeFiles = resumeData.map((resume) => {
          const file = resumeToFile(resume); // Convert resume to File
          return {
            id: resume.id, // Firestore document ID
            file, // File object from resumeToFile
            fileName: resume.fileName,
            fileType: resume.fileType,
            size: resume.size,
            uploadedAt: resume.uploadedAt,
          };
        });

        if (resumeFiles.length === 0) {
          if (isMounted) setResumes([]);
          return;
        }

        if (isMounted) {
          setResumes(resumeFiles);

          // Dispatch only resumes that don't already exist in the Redux store
          resumeFiles.forEach((resume) => {
            // Check if resume.id already exists in storedResumes
            const isDuplicate = storedResumes.some(
              (storedResume) => storedResume.id === resume.id
            );
            if (!isDuplicate) {
              dispatch(
                addResume({
                  id: resume.id,
                  fileName: resume.fileName,
                  fileType: resume.fileType,
                  size: resume.size,
                  uploadedAt: resume.uploadedAt || new Date().toISOString(),
                })
              );
            }
          });

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
  }, [user, dispatch, storedResumes]); // Include storedResumes in dependencies

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

export const useDeleteResume = async (id, userId, dispatch) => {
  try {
    // Delete the resume document from Firestore using the document ID
    await deleteDoc(doc(db, "users", userId, "resumes", id));

    // Update Redux store by dispatching removeResumeById
    dispatch(removeResumeById(id));

    successToast("Resume deleted successfully");
  } catch (error) {
    console.error("Error deleting resume:", error);
    errorToast("Failed to delete resume. Please try again.");
  }
};
