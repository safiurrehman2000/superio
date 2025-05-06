"use client";

import { useGetUploadedResumes } from "@/APIs/auth/resume";
import { isFirstTime } from "@/slices/userSlice";

import { auth, db } from "@/utils/firebase";
import {
  checkFileSize,
  checkFileTypes,
  fileToBase64,
} from "@/utils/resumeHelperFunctions";
import { successToast } from "@/utils/toast";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

const CvUploader = () => {
  const [getManager, setManager] = useState([]);
  const [getError, setError] = useState("");
  const user = auth.currentUser;

  const { resumes, loading, error: fetchError } = useGetUploadedResumes();

  // Sync getManager with fetched resumes
  useEffect(() => {
    if (resumes && resumes.length > 0) {
      setManager(resumes);
    }
  }, [resumes]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      setError(fetchError);
    }
  }, [fetchError]);

  // Ensure userType is "Candidate" before allowing upload
  useEffect(() => {
    const checkUserType = async () => {
      if (!user?.uid) {
        setError("Please log in to upload a resume");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.userType && userData.userType !== "Candidate") {
          setError("Only Candidates can upload resumes");
        } else if (!userData.userType) {
          // Set userType to "Candidate" if null
          await updateDoc(doc(db, "users", user.uid), {
            userType: "Candidate",
          });
        }
      } else {
        setError("User data not found");
      }
    };

    checkUserType();
  }, [user?.uid]);

  const cvManagerHandler = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    // Validate files
    if (!checkFileTypes(files)) {
      setError("Only .doc, .docx, or .pdf files are allowed");
      return;
    }
    if (!checkFileSize(files)) {
      setError("File size must be less than 500 KB");
      return;
    }

    const data = Array.from(files);
    const isExist = getManager.some((file1) =>
      data.some((file2) => file1.name === file2.name)
    );
    if (isExist) {
      setError("File already exists");
      return;
    }

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
        doc(db, "users", uid),
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

  // Delete resume from Firestore and local state
  const deleteHandler = async (name) => {
    try {
      // Find and delete the resume document
      const resumesQuery = query(
        collection(db, "users", user.uid, "resumes"),
        where("fileName", "==", name)
      );
      const querySnapshot = await getDocs(resumesQuery);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      const deleted = getManager.filter((file) => file.name !== name);
      setManager(deleted);
      successToast("Resume deleted successfully");
      setError("");
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume. Please try again.");
    }
  };

  return (
    <>
      {/* Start Upload resume */}
      <div className="uploading-resume">
        <div className="uploadButton">
          <input
            className="uploadButton-input"
            type="file"
            name="attachments[]"
            accept=".doc,.docx,application/pdf"
            id="upload"
            multiple
            onChange={cvManagerHandler}
            disabled={
              loading ||
              !user?.uid ||
              getError === "Only Candidates can upload resumes"
            }
          />
          <label className="cv-uploadButton" htmlFor="upload">
            <span className="title">Drop files here to upload</span>
            <span className="text">
              To upload file size is (Max 500 KB) and allowed file types are
              (.doc, .docx, .pdf)
            </span>
            <span className="theme-btn btn-style-one">Upload Resume</span>
            {getError && <p className="ui-danger mb-0">{getError}</p>}
          </label>
          <span className="uploadButton-file-name"></span>
        </div>
      </div>
      {/* End upload-resume */}

      {/* Start resume Preview */}
      <div className="files-outer">
        {getManager?.map((file, i) => (
          <div key={i} className="file-edit-box">
            <span className="title">{file.name}</span>
            <div className="edit-btns">
              <button disabled>
                <span className="la la-pencil"></span>
              </button>
              <button onClick={() => deleteHandler(file.name)}>
                <span className="la la-trash"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* End resume Preview */}
    </>
  );
};

export default CvUploader;
