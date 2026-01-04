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
      functionDescription: "",
      profileSkills: "",
      offer: "",
      schedule: "",
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
    watch,
    formState: { isValid },
  } = methods;

  const selectedEmployerId = watch("employerId");
  const selectedEmployer = employers.find((emp) => emp.id === selectedEmployerId);

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    if (!data.employerId) {
      setError("Please select an employer.");
      return;
    }

    // Verify the selected employer
    const employer = employers.find((emp) => emp.id === data.employerId);
    if (!employer) {
      setError("Selected employer not found. Please refresh and try again.");
      return;
    }

    console.log(
      `Creating job for employer: ${employer.email} (${employer.company_name || employer.name || "No name"})`
    );
    setLoading(true);
    try {
      const payload = {
        title: data.name,
        description: data.description,
        functionDescription: data.functionDescription,
        profileSkills: data.profileSkills,
        offer: data.offer,
        schedule: data.schedule,
        email: data.email,
        location: data.state,
        jobType: data["job-type"],
        tags: data.tags.map((tag) => tag.value),
        employerId: data.employerId,
        isOpen: true, // Set to true so job appears on listing page
        status: "active", // Explicitly set status to active
        createdAt: Date.now(),
        viewCount: 0,
      };

      // Sanitize the job data before saving
      const fieldTypes = {
        title: "title",
        description: "description",
        functionDescription: "description",
        profileSkills: "description",
        offer: "description",
        schedule: "description",
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
                        {emp.company_name || emp.name || emp.email} ({emp.email})
                      </option>
                    ))}
                  </select>
                  {selectedEmployer && (
                    <div
                      style={{
                        marginTop: "8px",
                        padding: "8px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      <strong>Selected:</strong> {selectedEmployer.email}
                      {selectedEmployer.company_name && (
                        <span> - {selectedEmployer.company_name}</span>
                      )}
                    </div>
                  )}
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
                <div className="form-group col-lg-12 col-md-12">
                  <TextAreaField
                    label="Functieomschrijving"
                    name="functionDescription"
                    placeholder="Beschrijf de functie in detail"
                    required
                  />
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <TextAreaField
                    label="Profiel/vaardigheden"
                    name="profileSkills"
                    placeholder="Beschrijf het gewenste profiel en vaardigheden"
                    required
                  />
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <TextAreaField
                    label="Aanbod"
                    name="offer"
                    placeholder="Beschrijf wat je aanbiedt (salaris, voordelen, etc.)"
                    required
                  />
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <TextAreaField
                    label="Uurrooster"
                    name="schedule"
                    placeholder="Beschrijf het uurrooster en werktijden"
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
                    disabled={loading || !selectedEmployerId}
                    style={{
                      opacity: !selectedEmployerId ? 0.6 : 1,
                      cursor: !selectedEmployerId ? "not-allowed" : "pointer",
                    }}
                  >
                    {loading ? "Posting..." : "Post Job"}
                  </button>
                  {!selectedEmployerId && (
                    <p
                      style={{
                        color: "#dc3545",
                        fontSize: "14px",
                        marginTop: "8px",
                      }}
                    >
                      Please select an employer to post a job
                    </p>
                  )}
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
