import { useDeleteResume, useUploadResume } from "@/APIs/auth/resume";
import Loading from "@/components/loading/Loading";
import "@/styles/customStyles.css";
import { checkFileSize, checkFileTypes } from "@/utils/resumeHelperFunctions";
import { errorToast } from "@/utils/toast";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const ApplyJobModalContent = () => {
  const [selected, setSelected] = useState(null);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const selector = useSelector((store) => store.user);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) {
      setShowError(true);
      return;
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
      data.some((file2) => file1.name === file2.name)
    );
    if (isExist) {
      errorToast("File already exists");
      return;
    }
    setLoading(true);
    const { success } = await useUploadResume(
      selector.user,
      data,
      dispatch,
      setShowError
    );

    setLoading(false);
  };

  return (
    <form className="default-form job-apply-form">
      {!showError && (
        <div className="mb-3" style={{ color: "#666", fontSize: "14px" }}>
          Please select a resume to apply with:
        </div>
      )}

      {/* Error message */}
      {showError && selected && (
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
                  accept="image/*, application/pdf"
                  id="upload"
                  multiple=""
                  onChange={cvManagerHandler}
                  required
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
            // required
          ></textarea>
        </div>
        {/* End .col */}

        {/* <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <div className="input-group checkboxes square">
            <input type="checkbox" name="remember-me" id="rememberMe" />
            <label htmlFor="rememberMe" className="remember">
              <span className="custom-checkbox"></span> You accept our{" "}
              <span data-bs-dismiss="modal">
                <Link href="/terms">
                  Terms and Conditions and Privacy Policy
                </Link>
              </span>
            </label>
          </div>
        </div> */}
        {/* End .col */}

        <div className="col-lg-12 col-md-12 col-sm-12 form-group">
          <button
            className="theme-btn btn-style-one w-100"
            type="submit"
            name="submit-form"
            onClick={handleSubmit}
          >
            Apply Job
          </button>
        </div>
        {/* End .col */}
      </div>
    </form>
  );
};

export default ApplyJobModalContent;
