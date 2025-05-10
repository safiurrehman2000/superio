"use client";

import {
  useDeleteResume,
  useGetUploadedResumes,
  useUploadResume,
} from "@/APIs/auth/resume";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { addResume, removeResumeById } from "@/slices/userSlice";

import { db } from "@/utils/firebase";
import { checkFileSize, checkFileTypes } from "@/utils/resumeHelperFunctions";
import { successToast } from "@/utils/toast";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const CvUploader = () => {
  const [getError, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { push } = useRouter();
  const selector = useSelector((store) => store.user);
  const dispatch = useDispatch();
  console.log("selector.resumes", selector?.resumes);
  const user = selector.user;

  const { resumes, loading, error: fetchError } = useGetUploadedResumes(user);

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
    const isExist = selector?.resumes.some((file1) =>
      data.some((file2) => file1.name === file2.name)
    );
    if (isExist) {
      setError("File already exists");
      return;
    }
    setIsLoading(true);
    const { success } = await useUploadResume(
      user,
      data,
      dispatch,
      setManager,
      setError
    );

    setIsLoading(false);
    if (success && selector.isFirstTime) {
      if (selector?.jobId) {
        push(`/job-list/${selector?.jobId}`);
      } else push("/job-list");
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
            <span className="theme-btn btn-style-one">
              {isLoading ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <CircularLoader />
                  <p style={{ margin: 0 }}>Uploading Resume...</p>
                </div>
              ) : (
                "Upload Resume"
              )}
            </span>
            {getError && <p className="ui-danger mb-0">{getError}</p>}
          </label>
          <span className="uploadButton-file-name"></span>
        </div>
      </div>
      {/* End upload-resume */}

      {/* Start resume Preview */}
      <div className="files-outer">
        {selector?.resumes?.map((file) => (
          <div key={file?.id} className="file-edit-box">
            <span className="title">{file.fileName}</span>
            <div className="edit-btns">
              <button disabled>
                <span className="la la-pencil"></span>
              </button>
              <button
                onClick={() =>
                  useDeleteResume(file.id, selector?.user?.uid, dispatch)
                }
              >
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
