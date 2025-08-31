"use client";
import { useEffect, useState } from "react";
import { db } from "@/utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { successToast, errorToast } from "@/utils/toast";
import { sanitizeFormData } from "@/utils/sanitization";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import AutoSelect from "@/components/autoselect/AutoSelect";
import { TextAreaField } from "@/components/textarea/TextArea";
import { JOB_TYPE_OPTIONS } from "@/utils/constants";
import { useStates, useSectors } from "@/utils/hooks/useOptionsFromFirebase";

const PostJobForEmployer = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch options from Firebase
  const { options: states, loading: statesLoading } = useStates();
  const { options: sectors, loading: sectorsLoading } = useSectors();

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userType", "==", "Employer"));
        const snap = await getDocs(q);
        setEmployers(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        setError("Failed to load employers");
      }
    };
    fetchEmployers();
  }, []);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      employerId: "",
      name: "",
      description: "",
      email: "",
      "job-type": "",
      state: "",
      tags: [],
    },
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isValid },
  } = methods;

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    if (!data.employerId) {
      setError("Please select an employer.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: data.name,
        description: data.description,
        email: data.email,
        location: data.state,
        jobType: data["job-type"],
        tags: data.tags.map((tag) => tag.value),
        employerId: data.employerId,
        isOpen: false,
        createdAt: Date.now(),
        viewCount: 0,
      };

      // Sanitize the job data before saving
      const fieldTypes = {
        title: "title",
        description: "description",
        email: "email",
        location: "text",
        jobType: "text",
        tags: "company_type",
        employerId: "employerid",
      };

      const sanitizedPayload = sanitizeFormData(payload, fieldTypes);

      await addDoc(collection(db, "jobs"), sanitizedPayload);
      setSuccess(true);
      reset();
      successToast("Job posted successfully for employer.");
    } catch (err) {
      setError("Failed to post job. " + err.message);
      errorToast("Failed to post job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Post Job for Employer</h4>
        </div>
        <div className="widget-content">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="default-form">
              <div className="row">
                <div className="form-group col-lg-12 col-md-12">
                  <label>Select Employer</label>
                  <select
                    className="form-select"
                    name="employerId"
                    value={methods.watch("employerId")}
                    onChange={(e) => setValue("employerId", e.target.value)}
                    required
                  >
                    <option value="">Select an employer...</option>
                    {employers.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.company_name || emp.email} ({emp.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <InputField
                    name="name"
                    placeholder="Title"
                    required
                    label="Job Title"
                    fieldType="Text"
                  />
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <TextAreaField
                    label="Description"
                    name="description"
                    placeholder="Describe what type of job it is"
                    required
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <InputField
                    label="Email"
                    name="email"
                    placeholder="candidate@gmail.com"
                    required
                    fieldType="Email"
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <SelectField
                    label="Job Type"
                    name="job-type"
                    options={JOB_TYPE_OPTIONS}
                    placeholder="Select a Job Type"
                    required
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <SelectField
                    label="State"
                    name="state"
                    options={states}
                    placeholder={
                      statesLoading ? "Loading states..." : "Select a state"
                    }
                    required
                    disabled={statesLoading}
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <AutoSelect
                    label="Job Tags"
                    placeholder={
                      sectorsLoading ? "Loading sectors..." : "Select Tags"
                    }
                    name="tags"
                    options={sectors}
                    required
                    disabled={sectorsLoading}
                  />
                </div>
                {error && (
                  <div className="form-group col-12" style={{ color: "red" }}>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="form-group col-12" style={{ color: "green" }}>
                    Job posted successfully!
                  </div>
                )}
                <div className="form-group col-lg-12 col-md-12 text-right">
                  <button
                    className="theme-btn btn-style-one"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Posting..." : "Post Job"}
                  </button>
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

export default PostJobForEmployer;
