'use client';

import { updateJob, deleteJob } from '@/APIs/auth/jobs';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import AutoSelect from '@/components/autoselect/AutoSelect';
import CircularLoader from '@/components/circular-loading/CircularLoading';
import { InputField } from '@/components/inputfield/InputField';
import { TextAreaField } from '@/components/textarea/TextArea';
import {
  debounce,
  formatString,
  getJobTypeOptions,
  jobTypeValuesToOptions,
  SECTORS,
} from '@/utils/constants';
import { useJobTypes } from '@/utils/hooks/useOptionsFromFirebase';
import { getCurrentUserToken } from '@/utils/auth-utils';
import { sanitizeFormData } from '@/utils/sanitization';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { DeleteConfirmationModal } from '@/components/dashboard-pages/employers-dashboard/manage-jobs/components/DeleteModal';

const EditJobPost = () => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPending, setSearchPending] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const selector = useSelector((store) => store.user);
  const { options: jobTypes, loading: jobTypesLoading } = useJobTypes();
  const jobTypeOptions = getJobTypeOptions(jobTypes);
  const debounceRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const methods = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      functionDescription: '',
      profileSkills: '',
      offer: '',
      schedule: '',
      email: '',
      'job-type': [],
      state: '',
      address: '',
      postalCode: '',
      salary: '',
      tags: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const emptyFormValues = {
    name: '',
    description: '',
    functionDescription: '',
    profileSkills: '',
    offer: '',
    schedule: '',
    email: '',
    'job-type': [],
    state: '',
    address: '',
    postalCode: '',
    salary: '',
    tags: [],
  };

  const searchJobs = useCallback(async (query) => {
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
      const params = new URLSearchParams({ q: trimmed, limit: '20' });
      const response = await fetch(`/api/admin/search-jobs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to search jobs');
      }
      setSearchResults(payload.data || []);
    } catch (err) {
      setSearchResults([]);
      setSearchError(err.message || 'Failed to search jobs');
    } finally {
      setSearchLoading(false);
      setSearchPending(false);
    }
  }, []);

  useEffect(() => {
    debounceRef.current = debounce((value) => {
      searchJobs(value);
    }, 400);
  }, [searchJobs]);

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

  const loadJobById = async (jobId) => {
    setJobLoading(true);
    setError(null);
    try {
      const jobSnap = await getDoc(doc(db, 'jobs', jobId));
      if (!jobSnap.exists()) {
        throw new Error('Job not found');
      }
      const job = { id: jobSnap.id, ...jobSnap.data() };
      setSelectedJobId(jobId);
      setSelectedJob(job);
      setSearchResults([]);
      setSearchInput(`${job.title || 'Untitled'}${job.location ? ` — ${job.location}` : ''}`);
    } catch (err) {
      setError(err.message || 'Failed to load job');
      setSelectedJobId('');
      setSelectedJob(null);
    } finally {
      setJobLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedJobId('');
    setSelectedJob(null);
    setSearchInput('');
    setSearchResults([]);
    setSearchPending(false);
    setSearchLoading(false);
    setSearchError(null);
    reset(emptyFormValues);
  };

  useEffect(() => {
    if (!selectedJob) {
      reset(emptyFormValues);
      return;
    }

    reset({
      name: selectedJob.title || '',
      description: selectedJob.description || '',
      functionDescription: selectedJob.functionDescription || '',
      profileSkills: selectedJob.profileSkills || '',
      offer: selectedJob.offer || '',
      schedule: selectedJob.schedule || '',
      email: selectedJob.email || selector?.user?.email || '',
      'job-type': jobTypeValuesToOptions(
        selectedJob.jobType ?? selectedJob.JobType,
        jobTypes,
      ),
      state: selectedJob.location || '',
      address: selectedJob.address || '',
      postalCode: selectedJob.postalCode || '',
      salary: selectedJob.salary || '',
      tags: selectedJob.tags
        ? selectedJob.tags.map((tag) => ({
            value: tag,
            label: formatString(tag),
          }))
        : [],
    });
  }, [selectedJob, jobTypes, jobTypesLoading, reset, selector?.user?.email]);

  const onSubmit = async (data) => {
    if (loading) return;
    if (!selectedJobId) {
      setError('Please search and select a job to edit');
      return;
    }

    setLoading(true);
    setError(null);

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
        jobType: (data['job-type'] || []).map((o) => o.value),
        address: data.address?.trim() ?? '',
        postalCode: data.postalCode?.trim() ?? '',
        salary: data.salary?.trim() ?? '',
        tags: data.tags.map((tag) => tag.value),
      };

      if (!selector?.user?.uid) {
        setError('You must be logged in to update a job.');
        setLoading(false);
        return;
      }

      const fieldTypes = {
        title: 'title',
        description: 'description',
        functionDescription: 'description',
        profileSkills: 'description',
        offer: 'description',
        schedule: 'description',
        email: 'email',
        location: 'text',
        jobType: 'job_type_array',
        address: 'company_location',
        postalCode: 'company_location',
        salary: 'company_location',
        tags: 'company_type',
      };

      const sanitized = sanitizeFormData(payload, fieldTypes);
      const { success, error: apiError } = await updateJob(
        selectedJobId,
        sanitized,
        selector.user.uid,
      );
      if (!success) {
        throw new Error(apiError || 'Failed to update job post.');
      }

      await loadJobById(selectedJobId);
    } catch (err) {
      setError(
        err.message || 'An unexpected error occurred. Please try again.',
      );
      console.error('Error during job post update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!selectedJobId) {
      setError('Please select a job to delete');
      return;
    }
    if (!selector?.user?.uid) {
      setError('User authentication data is missing.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { success, error: apiError } = await deleteJob(
        selectedJobId,
        selector.user.uid,
      );
      if (!success) {
        throw new Error(apiError || 'Failed to delete job post.');
      }
      clearSelection();
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(
        err.message || 'An unexpected error occurred. Please try again.',
      );
      console.error('Error during job post delete:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatJobDate = (createdAt) => {
    if (!createdAt) return '';
    const ms =
      typeof createdAt === 'number'
        ? createdAt < 1e12
          ? createdAt * 1000
          : createdAt
        : new Date(createdAt).getTime();
    if (!Number.isFinite(ms)) return '';
    return new Date(ms).toLocaleDateString();
  };

  return (
    <div className='ls-widget'>
      <div className='tabs-box'>
        <div className='widget-title'>
          <h4>Edit Job Posts</h4>
        </div>

        <div className='widget-content'>
          <FormProvider {...methods}>
            <div className='form-group col-lg-12 col-md-12 mb-4'>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '15px',
                  fontWeight: '500',
                  marginBottom: '6px',
                }}
              >
                Search job to edit
              </label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type='text'
                    className='form-control'
                    placeholder='Search by title, location, email, or job ID...'
                    value={searchInput}
                    onChange={handleSearchChange}
                    style={{ paddingRight: isSearching ? 40 : undefined }}
                  />
                  {isSearching && !selectedJobId && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      aria-hidden
                    >
                      <CircularLoader strokeColor='#1967d2' />
                    </div>
                  )}
                </div>
                {selectedJobId && (
                  <button
                    type='button'
                    className='theme-btn btn-style-two'
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                )}
              </div>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: '#666' }}>
                {isSearching && !selectedJobId
                  ? 'Searching jobs...'
                  : 'Type at least 2 characters. Only matching jobs are loaded.'}
              </p>

              {searchError && (
                <div style={{ color: 'red', marginTop: 8 }}>{searchError}</div>
              )}

              {!isSearching && searchResults.length > 0 && !selectedJobId && (
                <ul
                  style={{
                    listStyle: 'none',
                    margin: '12px 0 0',
                    padding: 0,
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  {searchResults.map((job) => (
                    <li key={job.id}>
                      <button
                        type='button'
                        onClick={() => loadJobById(job.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 16px',
                          border: 'none',
                          borderBottom: '1px solid #eee',
                          background: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        <strong>{job.title || 'Untitled'}</strong>
                        {job.location ? ` — ${job.location}` : ''}
                        <span style={{ display: 'block', fontSize: 13, color: '#666', marginTop: 4 }}>
                          {formatJobDate(job.createdAt)}
                          {job.email ? ` · ${job.email}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!isSearching &&
                searchInput.trim().length >= 2 &&
                searchResults.length === 0 &&
                !selectedJobId &&
                !searchError && (
                  <p style={{ marginTop: 12, color: '#666' }}>No jobs found.</p>
                )}
            </div>

            {jobLoading && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <CircularLoader />
              </div>
            )}

            {selectedJobId && selectedJob && !jobLoading && (
              <form
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmit(onSubmit)();
                  }
                }}
                onSubmit={handleSubmit(onSubmit)}
                className='default-form'
              >
                <div className='row'>
                  <div className='form-group col-lg-12 col-md-12'>
                    <InputField
                      name='name'
                      placeholder='Title'
                      required
                      label='Job Title'
                      fieldType='Text'
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <TextAreaField
                      label='Description'
                      name='description'
                      placeholder='Describe what type of job it is'
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <TextAreaField
                      label='Functieomschrijving'
                      name='functionDescription'
                      placeholder='Beschrijf de functie in detail'
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <TextAreaField
                      label='Profiel/vaardigheden'
                      name='profileSkills'
                      placeholder='Beschrijf het gewenste profiel en vaardigheden'
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <TextAreaField
                      label='Aanbod'
                      name='offer'
                      placeholder='Beschrijf wat je aanbiedt (salaris, voordelen, etc.)'
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <TextAreaField
                      label='Uurrooster'
                      name='schedule'
                      placeholder='Beschrijf het uurrooster en werktijden'
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <InputField
                      label='Email'
                      name='email'
                      placeholder='candidate@gmail.com'
                      required
                      fieldType='Email'
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <AutoSelect
                      label='Job Type'
                      name='job-type'
                      options={jobTypeOptions}
                      placeholder={
                        jobTypesLoading
                          ? 'Loading job types...'
                          : 'Select one or more contract types'
                      }
                      disabled={jobTypesLoading}
                      required
                      defaultValue={[]}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <InputField
                      label='Gemeente'
                      name='state'
                      placeholder='bijv. Antwerpen'
                      fieldType='Text'
                      required
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <InputField
                      label='Postcode'
                      name='postalCode'
                      placeholder='e.g. 2000'
                      fieldType='Text'
                      required={false}
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-12 col-md-12'>
                    <InputField
                      label='Adres'
                      name='address'
                      placeholder='Straat en huisnummer'
                      fieldType='Text'
                      required={false}
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <InputField
                      label='Salaris (optioneel)'
                      name='salary'
                      placeholder='e.g. 15-20 €/uur of 2500 €/maand'
                      fieldType='Text'
                      required={false}
                      defaultValue=''
                      disabled={false}
                    />
                  </div>

                  <div className='form-group col-lg-6 col-md-12'>
                    <AutoSelect
                      label='Job Tags'
                      placeholder='Select Tags'
                      name='tags'
                      options={SECTORS}
                      required
                      defaultValue={[]}
                    />
                  </div>

                  <div
                    className='form-group col-lg-12 col-md-12 text-right'
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <button
                      className={`theme-btn ${
                        loading ? 'btn-style-three' : 'btn-style-one'
                      }`}
                      type='submit'
                      disabled={loading}
                    >
                      {loading ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <CircularLoader />
                          <p style={{ margin: 0 }}>Updating Job Post...</p>
                        </div>
                      ) : (
                        'Update Job'
                      )}
                    </button>
                    <button
                      type='button'
                      className='theme-btn btn-style-two ml-2'
                      style={{ background: '#dc3545', color: '#fff' }}
                      onClick={() => setIsDeleteModalOpen(true)}
                      disabled={loading}
                    >
                      {loading ? 'Deleting...' : 'Delete Job'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {!selectedJobId && !jobLoading && searchInput.trim().length < 2 && (
              <div
                className='text-center'
                style={{ padding: '40px', color: '#666' }}
              >
                <p>Search for a job above to edit its information.</p>
              </div>
            )}
            {error && (
              <div style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
                {error}
              </div>
            )}
          </FormProvider>
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isDeleting={loading}
      />
    </div>
  );
};

export default EditJobPost;
