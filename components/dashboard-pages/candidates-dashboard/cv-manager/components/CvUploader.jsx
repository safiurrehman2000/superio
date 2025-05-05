"use client";

import { auth, db } from "@/utils/firebase"; // Adjust path to your Firebase config
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

// Validation function for file types
function checkFileTypes(files) {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  return Array.from(files).every((file) => allowedTypes.includes(file.type));
}

// Validation function for file size (max 500 KB)
function checkFileSize(files) {
  const maxSize = 500 * 1024; // 500 KB in bytes
  return Array.from(files).every((file) => file.size <= maxSize);
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // Extract base64 data
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function resumeToFile(resume) {
  const byteString = atob(resume.fileData);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return new File([byteArray], resume.fileName, { type: resume.fileType });
}

const CvUploader = () => {
  const [getManager, setManager] = useState([]);
  const [getError, setError] = useState("");
  const user = auth.currentUser;

  // Ensure userType is "Candidate" before allowing upload
  useEffect(() => {
    const checkUserType = async () => {
      if (!user.uid) {
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
  }, [user.uid]);

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

      setManager((prev) => [...prev, ...data]);
      setError("");
    } catch (error) {
      console.error("Error uploading resume:", error);
      setError("Failed to upload resume. Please try again.");
    }
  };

  // Delete resume from Firestore and local state
  const deleteHandler = async (name) => {
    try {
      // Find and delete the resume document (assumes fileName is unique)
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
      setError("");
    } catch (error) {
      console.error("Error deleting resume:", error);
      setError("Failed to delete resume. Please try again.");
    }
  };

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user?.uid) {
        setError("Please log in to upload a resume");
        return;
      }

      try {
        const resumesSnapshot = await getDocs(
          collection(db, "users", user.uid, "resumes")
        );
        const resumes = resumesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const files = resumes.map(resumeToFile);
        setManager(files);
        setError("");
      } catch (error) {
        console.error("Error fetching resumes:", error);
        setError("Failed to load resumes. Please try again.");
      }
    };

    fetchResumes();
  }, [user?.uid]);

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
              !user.uid || getError === "Only Candidates can upload resumes"
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
