import { isFirstTime } from "@/slices/userSlice";
import { auth, db } from "@/utils/firebase";
import { fileToBase64, resumeToFile } from "@/utils/resumeHelperFunctions";
import { errorToast, successToast } from "@/utils/toast";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export const useGetUploadedResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const { push } = useRouter();
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
        // if (files.length > 0) {
        //   dispatch(isFirstTime());
        //   push("/job-list");
        // }
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

export const useUploadResume = async (data, setManager, setError) => {
  const user = auth.currentUser;
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
    await setDoc(
      doc(db, "users", user.uid),
      { isFirstTime: false },
      { merge: true }
    );
    setManager((prev) => [...prev, ...data]);
    successToast("Resume uploaded successfully");
    setError("");
  } catch (error) {
    console.error("Error uploading resume:", error);
    setError("Failed to upload resume. Please try again.");
  }
};
