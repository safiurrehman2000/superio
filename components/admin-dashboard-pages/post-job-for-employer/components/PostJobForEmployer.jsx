"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { successToast, errorToast } from "@/utils/toast";
import { sanitizeFormData } from "@/utils/sanitization";
import { debounce } from "@/utils/constants";
import { getCurrentUserToken } from "@/utils/auth-utils";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import AutoSelect from "@/components/autoselect/AutoSelect";
import { TextAreaField } from "@/components/textarea/TextArea";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { getJobTypeOptions } from "@/utils/constants";
import {
  useJobTypes,
  useStates,
  useSectors,
} from "@/utils/hooks/useOptionsFromFirebase";

const PostJobForEmployer = () => {
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [employerLoading, setEmployerLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const debounceRef = useRef(null);

  const { options: states, loading: statesLoading } = useStates();
  const { options: sectors, loading: sectorsLoading } = useSectors();
  const { options: jobTypes, loading: jobTypesLoading } = useJobTypes();
  const jobTypeOptions = getJobTypeOptions(jobTypes);

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
      "job-type": [],
      state: "",
      address: "",
      postalCode: "",
      salary: "",
      tags: [],
    },
  });

  const { handleSubmit, reset, setValue, watch } = methods;

  const selectedEmployerId = watch("employerId");
  const isSearching = searchPending || searchLoading;

  const getEmployerLabel = (employer) => {
    const name = employer.company_name || employer.name || "Unknown";
    return `${name} — ${employer.email || employer.id}`;
  };

  const searchEmployers = useCallback(async (query) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      setSearchPending(false);
      return;
    }

    setSearchLoading(true);
    setSearchPending(true);
    setSearchError(null);

    try {
      const token = await getCurrentUserToken();
      const params = new URLSearchParams({
        q: trimmed,
        limit: "20",
        userType: "Employer",
      });
      const response = await fetch(`/api/admin/search-users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to search employers");
      }
      setSearchResults(payload.data || []);
    } catch (err) {
      setSearchResults([]);
      setSearchError(err.message || "Failed to search employers");
    } finally {
      setSearchLoading(false);
      setSearchPending(false);
    }
  }, []);

  useEffect(() => {
    debounceRef.current = debounce((value) => {
      searchEmployers(value);
    }, 400);
  }, [searchEmployers]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSearchPending(false);
      setSearchLoading(false);
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setSearchPending(true);
    if (debounceRef.current) {
      debounceRef.current(value);
    }
  };

  const loadEmployerById = async (employerId) => {
    setEmployerLoading(true);
    setError(null);
    try {
      const employerSnap = await getDoc(doc(db, "users", employerId));
      if (!employerSnap.exists()) {
        throw new Error("Employer not found");
      }
      const employer = { id: employerSnap.id, ...employerSnap.data() };
      if (employer.userType !== "Employer") {
        throw new Error("Selected user is not an employer");
      }
      setSelectedEmployer(employer);
      setValue("employerId", employerId);
      setValue("email", employer.email || "");
      setSearchResults([]);
      setSearchInput(getEmployerLabel(employer));
    } catch (err) {
      setError(err.message || "Failed to load employer");
      setSelectedEmployer(null);
      setValue("employerId", "");
    } finally {
      setEmployerLoading(false);
    }
  };

  const clearEmployer = () => {
    setSelectedEmployer(null);
    setSearchInput("");
    setSearchResults([]);
    setSearchPending(false);
    setSearchLoading(false);
    setSearchError(null);
    setValue("employerId", "");
    setValue("email", "");
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(false);
    if (!data.employerId || !selectedEmployer) {
      setError("Please search and select an employer.");
      return;
    }

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
        jobType: (data["job-type"] || []).map((o) => o.value),
        address: data.address || undefined,
        postalCode: data.postalCode || undefined,
        salary: data.salary || undefined,
        tags: data.tags.map((tag) => tag.value),
        employerId: data.employerId,
        isOpen: true,
        status: "active",
        createdAt: Date.now(),
        viewCount: 0,
      };

      const fieldTypes = {
        title: "title",
        description: "description",
        functionDescription: "description",
        profileSkills: "description",
        offer: "description",
        schedule: "description",
        email: "email",
        location: "text",
        jobType: "job_type_array",
        address: "company_location",
        postalCode: "company_location",
        salary: "company_location",
        tags: "company_type",
        employerId: "employerid",
      };

      const sanitizedPayload = sanitizeFormData(payload, fieldTypes);

      await addDoc(collection(db, "jobs"), sanitizedPayload);
      setSuccess(true);
      reset({
        employerId: "",
        name: "",
        description: "",
        functionDescription: "",
        profileSkills: "",
        offer: "",
        schedule: "",
        email: "",
        "job-type": [],
        state: "",
        address: "",
        postalCode: "",
        salary: "",
        tags: [],
      });
      clearEmployer();
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
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "15px",
                      fontWeight: "500",
                      marginBottom: "6px",
                    }}
                  >
                    Search employer
                  </label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by company name, email, or user ID..."
                        value={searchInput}
                        onChange={handleSearchChange}
                        style={{ paddingRight: isSearching ? 40 : undefined }}
                      />
                      {isSearching && !selectedEmployerId && (
                        <div
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            display: "flex",
                            alignItems: "center",
                          }}
                          aria-hidden
                        >
                          <CircularLoader strokeColor="#1967d2" />
                        </div>
                      )}
                    </div>
                    {selectedEmployerId && (
                      <button
                        type="button"
                        className="theme-btn btn-style-two"
                        onClick={clearEmployer}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>
                    {isSearching && !selectedEmployerId
                      ? "Searching employers..."
                      : "Type at least 2 characters. Only matching employers are loaded."}
                  </p>

                  {searchError && (
                    <div style={{ color: "red", marginTop: 8 }}>{searchError}</div>
                  )}

                  {!isSearching &&
                    searchResults.length > 0 &&
                    !selectedEmployerId && (
                      <ul
                        style={{
                          listStyle: "none",
                          margin: "12px 0 0",
                          padding: 0,
                          border: "1px solid #e8e8e8",
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        {searchResults.map((employer) => (
                          <li key={employer.id}>
                            <button
                              type="button"
                              onClick={() => loadEmployerById(employer.id)}
                              style={{
                                width: "100%",
                                textAlign: "left",
                                padding: "12px 16px",
                                border: "none",
                                borderBottom: "1px solid #eee",
                                background: "#fff",
                                cursor: "pointer",
                              }}
                            >
                              {getEmployerLabel(employer)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                  {!isSearching &&
                    searchInput.trim().length >= 2 &&
                    searchResults.length === 0 &&
                    !selectedEmployerId &&
                    !searchError && (
                      <p style={{ marginTop: 12, color: "#666" }}>
                        No employers found.
                      </p>
                    )}

                  {employerLoading && (
                    <div style={{ padding: "12px 0" }}>
                      <CircularLoader />
                    </div>
                  )}

                  {selectedEmployer && !employerLoading && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      <strong>Selected:</strong> {selectedEmployer.email}
                      {selectedEmployer.company_name && (
                        <span> — {selectedEmployer.company_name}</span>
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
                  <AutoSelect
                    label="Job Type"
                    name="job-type"
                    options={jobTypeOptions}
                    placeholder={
                      jobTypesLoading
                        ? "Loading job types..."
                        : "Select one or more contract types"
                    }
                    required
                    defaultValue={[]}
                    disabled={jobTypesLoading}
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
                  <InputField
                    label="Postcode"
                    name="postalCode"
                    placeholder="e.g. 2000"
                    fieldType="Text"
                  />
                </div>
                <div className="form-group col-lg-12 col-md-12">
                  <InputField
                    label="Adres"
                    name="address"
                    placeholder="Straat en huisnummer"
                    fieldType="Text"
                  />
                </div>
                <div className="form-group col-lg-6 col-md-12">
                  <InputField
                    label="Salaris (optioneel)"
                    name="salary"
                    placeholder="e.g. 15-20 €/uur of 2500 €/maand"
                    fieldType="Text"
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
                      Please search and select an employer to post a job
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
