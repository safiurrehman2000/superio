import { useApplyForJob } from "@/APIs/auth/jobs";
import { useDeleteResume, useUploadResume } from "@/APIs/auth/resume";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import Loading from "@/components/loading/Loading";
import "@/styles/customStyles.css";
import { checkFileSize, checkFileTypes } from "@/utils/resumeHelperFunctions";
import { errorToast } from "@/utils/toast";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ApplyJobModalContent = () => {
  const [selected, setSelected] = useState(null);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);
  const { id: jobId } = useParams();
  const hasApplied = selector.appliedJobs.includes(jobId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setShowError(true);
      errorToast("Please select a resume before applying.");
      return;
    }
    if (hasApplied) {
      errorToast("You have already applied to this job.");
      return;
    }
    setLoading(true);
    setShowError(false);

    try {
      const selectedResume = selector?.resumes?.find(
        (resume) => resume.id === selected
      );
      if (!selectedResume) throw new Error("Selected resume not found.");

      const result = await useApplyForJob(
        selector?.user?.uid,
        selectedResume,
        jobId,
        message,
        selector.appliedJobs,
        dispatch
      );

      if (result.success) {
        setMessage("");
        setSelected(null);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      errorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cvManagerHandler = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    // Validate files
    if (!checkFileTypes(files)) {
      errorToast("Only .doc, .docx, or .pdf files are allowed");
      return;
    }
    if (!checkFileSize(files)) {
      errorToast("File size must be less than 500 KB");
      return;
    }

    const data = Array.from(files);
    const isExist = selector?.resumes.some((file1) =>
      data.some((file2) => file1.fileName === file2.name)
    );
    if (isExist) {
      errorToast("File already exists");
      return;
    }

    const { success } = await useUploadResume(
      selector.user,
      data,
      dispatch,
      setShowError,
      setLoading
    );

    if (success) {
      // Auto-select the newly uploaded resume
      const newResume = selector?.resumes?.find(
        (resume) => resume.fileName === data[0].name
      );
      if (newResume) setSelected(newResume.id);
    }
  };

  return (
    <form className="default-form job-apply-form" onSubmit={handleSubmit}>
      {!showError && (
        <div className="mb-3" style={{ color: "#666", fontSize: "14px" }}>
          Please select a resume to apply with:
        </div>
      )}

      {/* Error message */}
      {showError && (
        <div className="mb-3" style={{ color: "#ff4d4f", fontSize: "14px" }}>
          Please select a resume before applying.
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          cursor: "pointer",
        }}
      >
        {selector?.resumes?.map((file) => (
          <div
            key={file?.id}
            onClick={() => {
              setSelected(file.id);
            }}
            className={`file-edit-box job-filter ${
              selected === file.id ? "selected-resume" : ""
            }`}
            style={{
              border: selected === file.id ? "2px solid #fa5508" : "none",
              borderRadius: "5px",
            }}
          >
            <span
              className="title"
              style={{
                wordBreak: "break-word",
                fontSize: "15px",
                WebkitLineClamp: 1,
                overflow: "hidden",
              }}
            >
              {file.fileName}
            </span>
            <div className="edit-btns">
              <button disabled>
                <span className="la la-pencil"></span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  useDeleteResume(file.id, selector?.user?.uid, dispatch);
                }}
              >
                <span className="la la-trash"></span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        {loading ? (
          <Loading />
        ) : (
          <div className="col-lg-12 col-md-12 col-sm-12 form-group">
            <div className="uploading-outer apply-cv-outer">
              <div className="uploadButton">
                <input
                  className="uploadButton-input"
                  type="file"
                  name="attachments[]"
                  accept=".doc,.docx,application/pdf"
                  id="upload"
                  multiple=""
                  onChange={cvManagerHandler}
                />
                <label
                  className="uploadButton-button ripple-effect"
                  htmlFor="upload"
                >
                  Upload CV (doc, docx, pdf)
                </label>
              </div>
            </div>
          </div>
        )}
        {/* End .col */}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <textarea
            className="darma"
            name="message"
            placeholder="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={hasApplied}
          ></textarea>
        </div>
        {/* End .col */}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <button
            className={`theme-btn ${
              loading || hasApplied ? "btn-style-three" : "btn-style-one"
            } w-100`}
            type="submit"
            name="submit-form"
            disabled={loading || hasApplied}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularLoader /> <p>Applying...</p>
              </div>
            ) : hasApplied ? (
              "Applied"
            ) : (
              "Apply Job"
            )}
          </button>
        </div>
        {/* End .col */}
      </div>
    </form>
  );
};

export default ApplyJobModalContent;
