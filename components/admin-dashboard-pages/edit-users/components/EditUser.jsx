"use client";

import { updateUserByAdmin } from "@/APIs/auth/database";
import { deleteUserCompletelyByAdmin } from "@/APIs/auth/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import AutoSelect from "@/components/autoselect/AutoSelect";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { InputField } from "@/components/inputfield/InputField";
import { SelectField } from "@/components/selectfield/SelectField";
import { TextAreaField } from "@/components/textarea/TextArea";
import {
  AGE_OPTIONS,
  debounce,
  GENDERS,
  PROFILE_VISIBILITY_OPTIONS,
} from "@/utils/constants";
import { useStates, useSectors } from "@/utils/hooks/useOptionsFromFirebase";
import { getCurrentUserToken } from "@/utils/auth-utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import AdminLogoUpload from "./AdminLogoUpload";

const EditUser = () => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const { options: states, loading: statesLoading } = useStates();
  const { options: sectors, loading: sectorsLoading } = useSectors();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const methods = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      name: "",
      title: "",
      phone_number: "",
      gender: "",
      age: "",
      profile_visibility: "",
      description: "",
      logo: null,
      company_name: "",
      phone: "",
      website: "",
      company_type: [],
      company_location: "",
    },
  });

  const { handleSubmit, reset, setValue } = methods;

  const userType = selectedUser?.userType;

  const emptyFormValues = {
    email: "",
    name: "",
    title: "",
    phone_number: "",
    gender: "",
    age: "",
    profile_visibility: "",
    description: "",
    logo: null,
    company_name: "",
    phone: "",
    website: "",
    company_type: [],
    company_location: "",
  };

  const populateForm = (user) => {
    reset();
    setValue("email", user.email || "");

    if (user.userType === "Candidate") {
      setValue("name", user.name || "");
      setValue("title", user.title || "");
      setValue("phone_number", user.phone_number || "");
      setValue("gender", user.gender || "");
      setValue("age", user.age || "");
      setValue("profile_visibility", user.profile_visibility || "");
      setValue("description", user.description || "");
      return;
    }

    if (user.userType === "Employer") {
      if (user.logo) {
        setValue(
          "logo",
          user.logo.startsWith("data:image")
            ? user.logo
            : `data:image/jpeg;base64,${user.logo}`,
        );
      } else {
        setValue("logo", null);
      }
      setValue("company_name", user.company_name || "");
      setValue("phone", user.phone || "");
      setValue("website", user.website || "");
      setValue("company_type", user.company_type || []);
      setValue("company_location", user.company_location || "");
      setValue("description", user.description || "");
    }
  };

  const searchUsers = useCallback(async (query) => {
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
      const params = new URLSearchParams({ q: trimmed, limit: "20" });
      const response = await fetch(`/api/admin/search-users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to search users");
      }
      setSearchResults(payload.data || []);
    } catch (err) {
      setSearchResults([]);
      setSearchError(err.message || "Failed to search users");
    } finally {
      setSearchLoading(false);
      setSearchPending(false);
    }
  }, []);

  useEffect(() => {
    debounceRef.current = debounce((value) => {
      searchUsers(value);
    }, 400);
  }, [searchUsers]);

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

  const isSearching = searchPending || searchLoading;

  const getUserLabel = (user) => {
    if (user.userType === "Candidate") {
      return `${user.name || "Unknown"} (Candidate) — ${user.email || user.id}`;
    }
    if (user.userType === "Employer") {
      return `${user.company_name || "Unknown Company"} (Employer) — ${user.email || user.id}`;
    }
    return user.email || user.id;
  };

  const loadUserById = async (userId) => {
    setUserLoading(true);
    setError(null);
    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }
      const user = { id: userSnap.id, ...userSnap.data() };
      setSelectedUserId(userId);
      setSelectedUser(user);
      setSearchResults([]);
      setSearchInput(getUserLabel(user));
      populateForm(user);
    } catch (err) {
      setError(err.message || "Failed to load user");
      setSelectedUserId("");
      setSelectedUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedUserId("");
    setSelectedUser(null);
    setSearchInput("");
    setSearchResults([]);
    setSearchPending(false);
    setSearchLoading(false);
    setSearchError(null);
    reset(emptyFormValues);
  };

  const onSubmit = async (data) => {
    if (loading) return;
    if (!selectedUserId) {
      setError("Please search and select a user to edit");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanData = (obj) => {
        const cleaned = {};
        const optionalFields = [
          "title",
          "phone_number",
          "website",
          "company_type",
          "company_location",
          "description",
        ];

        Object.keys(obj).forEach((key) => {
          if (obj[key] !== undefined) {
            if (optionalFields.includes(key) && obj[key] === "") {
              cleaned[key] = null;
            } else {
              cleaned[key] = obj[key];
            }
          }
        });
        return cleaned;
      };

      let payload = { email: data.email, logo: data.logo };

      if (userType === "Candidate") {
        payload = {
          ...payload,
          name: data.name,
          title: data.title,
          phone_number: data.phone_number,
          gender: data.gender,
          age: data.age,
          profile_visibility: data.profile_visibility,
          description: data.description,
        };
      } else if (userType === "Employer") {
        payload = {
          ...payload,
          company_name: data.company_name,
          phone: data.phone,
          website: data.website,
          company_type: data.company_type,
          company_location: data.company_location,
          description: data.description,
        };
      }

      payload = cleanData(payload);

      const { success, error: apiError } = await updateUserByAdmin(
        selectedUserId,
        payload,
      );
      if (!success) {
        throw new Error(apiError || "Failed to update user.");
      }

      await loadUserById(selectedUserId);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
      console.error("Error during user update:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const { success, error: deleteErr } =
        await deleteUserCompletelyByAdmin(selectedUserId);
      if (!success) {
        throw new Error(deleteErr || "Failed to delete user completely.");
      }
      setShowDeleteModal(false);
      clearSelection();
    } catch (err) {
      setDeleteError(err.message || "An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Edit Users</h4>
        </div>

        <div className="widget-content">
          <div className="form-group col-lg-12 col-md-12 mb-4">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "15px",
                fontWeight: "500",
                marginBottom: "6px",
              }}
            >
              Search user to edit
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name, email, company, or user ID..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  style={{ paddingRight: isSearching ? 40 : undefined }}
                />
                {isSearching && !selectedUserId && (
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
              {selectedUserId && (
                <button
                  type="button"
                  className="theme-btn btn-style-two"
                  onClick={clearSelection}
                >
                  Clear
                </button>
              )}
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>
              {isSearching && !selectedUserId
                ? "Searching users..."
                : "Type at least 2 characters. Only matching users are loaded."}
            </p>

            {searchError && (
              <div style={{ color: "red", marginTop: 8 }}>{searchError}</div>
            )}

            {!isSearching && searchResults.length > 0 && !selectedUserId && (
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
                {searchResults.map((user) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => loadUserById(user.id)}
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
                      {getUserLabel(user)}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {!isSearching &&
              searchInput.trim().length >= 2 &&
              searchResults.length === 0 &&
              !selectedUserId &&
              !searchError && (
                <p style={{ marginTop: 12, color: "#666" }}>No users found.</p>
              )}
          </div>

          {userLoading && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 24,
              }}
            >
              <CircularLoader />
            </div>
          )}

          {selectedUserId && selectedUser && !userLoading && (
            <FormProvider {...methods}>
              <form
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit(onSubmit)();
                  }
                }}
                onSubmit={handleSubmit(onSubmit)}
                className="default-form"
              >
                <div className="row">
                  {userType === "Employer" && (
                    <div className="form-group col-lg-12 col-md-12">
                      <AdminLogoUpload />
                    </div>
                  )}

                  <div className="form-group col-lg-6 col-md-12">
                    <InputField
                      label="Email"
                      name="email"
                      placeholder="user@example.com"
                      required
                      fieldType="Email"
                      defaultValue=""
                      disabled={false}
                    />
                  </div>

                  {userType === "Candidate" ? (
                    <>
                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Full Name"
                          name="name"
                          placeholder="John Doe"
                          required
                          fieldType="Name"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Job Title"
                          name="title"
                          placeholder="Software Developer"
                          fieldType="Text"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Phone"
                          name="phone_number"
                          placeholder="1234567890"
                          fieldType="Phone"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Gender"
                          name="gender"
                          options={GENDERS}
                          placeholder="Select a gender"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Age"
                          name="age"
                          options={AGE_OPTIONS}
                          placeholder="Select age"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Profile Visibility"
                          name="profile_visibility"
                          options={PROFILE_VISIBILITY_OPTIONS}
                          placeholder="Select visibility"
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12">
                        <TextAreaField
                          label="Description"
                          name="description"
                          placeholder="Tell us about yourself..."
                          minLength={10}
                          maxLength={1000}
                          required={false}
                        />
                      </div>
                    </>
                  ) : userType === "Employer" ? (
                    <>
                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Company Name"
                          name="company_name"
                          placeholder="Company Name"
                          required
                          fieldType="Name"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Phone"
                          name="phone"
                          placeholder="1234567890"
                          required
                          fieldType="Phone"
                          defaultValue=""
                          disabled={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <InputField
                          label="Website"
                          name="website"
                          placeholder="www.example.com"
                          fieldType="URL"
                          defaultValue=""
                          disabled={false}
                          required={false}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <AutoSelect
                          label="Company Type"
                          placeholder={
                            sectorsLoading
                              ? "Loading sectors..."
                              : "Select company types"
                          }
                          name="company_type"
                          options={sectors}
                          required
                          defaultValue={[]}
                          disabled={sectorsLoading}
                        />
                      </div>

                      <div className="form-group col-lg-6 col-md-12">
                        <SelectField
                          label="Location"
                          name="company_location"
                          options={states}
                          placeholder={
                            statesLoading
                              ? "Loading states..."
                              : "Select a state"
                          }
                          required
                          disabled={statesLoading}
                        />
                      </div>

                      <div className="form-group col-lg-12 col-md-12">
                        <TextAreaField
                          label="About Company"
                          name="description"
                          placeholder="Tell us about your company..."
                          minLength={10}
                          maxLength={1000}
                          required={false}
                        />
                      </div>
                    </>
                  ) : null}

                  {error && (
                    <div className="form-group col-12" style={{ color: "red" }}>
                      {error}
                    </div>
                  )}

                  <div
                    className="form-group col-lg-12 col-md-12 d-flex justify-content-between align-items-center"
                    style={{ marginTop: 20, gap: 16 }}
                  >
                    <button
                      className={`theme-btn ${
                        loading ? "btn-style-three" : "btn-style-one"
                      }`}
                      type="submit"
                      disabled={loading || deleteLoading}
                    >
                      {loading ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <CircularLoader />
                          <p style={{ margin: 0 }}>Updating User...</p>
                        </div>
                      ) : (
                        "Update User"
                      )}
                    </button>
                    <button
                      type="button"
                      className="theme-btn btn-style-one"
                      style={{ background: "#dc3545", color: "#fff" }}
                      onClick={() => setShowDeleteModal(true)}
                      disabled={loading || deleteLoading}
                    >
                      {deleteLoading ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </form>
            </FormProvider>
          )}

          {selectedUserId && showDeleteModal && (
            <div
              className="modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.4)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className="modal-content"
                style={{
                  background: "#fff",
                  padding: 32,
                  borderRadius: 8,
                  maxWidth: 400,
                  width: "100%",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
                }}
              >
                <h4 style={{ marginBottom: 16 }}>Confirm Deletion</h4>
                <p>
                  Are you sure you want to delete this user and all related
                  data? This action cannot be undone.
                </p>
                {deleteError && (
                  <div style={{ color: "red", marginBottom: 8 }}>
                    {deleteError}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 12,
                    marginTop: 24,
                  }}
                >
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="theme-btn btn-style-one"
                    style={{ background: "#dc3545", color: "#fff" }}
                    onClick={handleDeleteUser}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!selectedUserId && !userLoading && searchInput.trim().length < 2 && (
            <div
              className="text-center"
              style={{ padding: "40px", color: "#666" }}
            >
              <p>Search for a user above to edit their information.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditUser;
