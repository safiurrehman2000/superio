'use client';

import { useGetJobById, updateJob } from '@/APIs/auth/jobs';
import AutoSelect from '@/components/autoselect/AutoSelect';
import CircularLoader from '@/components/circular-loading/CircularLoading';
import { InputField } from '@/components/inputfield/InputField';
import { TextAreaField } from '@/components/textarea/TextArea';
import {
  formatString,
  getJobTypeOptions,
  jobTypeValuesToOptions,
} from '@/utils/constants';
import { useJobTypes, useSectors } from '@/utils/hooks/useOptionsFromFirebase';
import { sanitizeFormData } from '@/utils/sanitization';
import { errorToast } from '@/utils/toast';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

const EditEmployerJobForm = () => {
  const params = useParams();
  const jobId = params?.id;
  const { push } = useRouter();
  const selector = useSelector((store) => store.user);
  const { job, loading, error } = useGetJobById(jobId);
  const { options: sectors, loading: sectorsLoading } = useSectors();
  const { options: jobTypes, loading: jobTypesLoading } = useJobTypes();
  const jobTypeOptions = getJobTypeOptions(jobTypes);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const methods = useForm({
    mode: 'onSubmit',
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

  const { handleSubmit, reset, setValue } = methods;

  useEffect(() => {
    if (selector?.user?.email) {
      setValue('email', selector.user.email);
    }
  }, [selector?.user?.email, setValue]);

  useEffect(() => {
    if (!loading && job && selector?.user?.uid) {
      if (job.employerId !== selector.user.uid) {
        setForbidden(true);
        errorToast('You can only edit your own job postings');
        push('/employers-dashboard/manage-jobs');
      }
    }
  }, [loading, job, selector?.user?.uid, push]);

  useEffect(() => {
    if (!job || sectorsLoading || jobTypesLoading) return;

    reset({
      name: job.title || '',
      description: job.description || '',
      functionDescription: job.functionDescription || '',
      profileSkills: job.profileSkills || '',
      offer: job.offer || '',
      schedule: job.schedule || '',
      email: job.email || selector?.user?.email || '',
      'job-type': jobTypeValuesToOptions(
        job.jobType ?? job.JobType,
        jobTypes,
      ),
      state: job.location || '',
      address: job.address || '',
      postalCode: job.postalCode || '',
      salary: job.salary || '',
      tags: job.tags
        ? job.tags.map((tag) => {
            const opt = sectors.find((s) => s.value === tag);
            return opt || { value: tag, label: formatString(tag) };
          })
        : [],
    });
  }, [job, sectors, sectorsLoading, jobTypes, jobTypesLoading, reset, selector?.user?.email]);

  const onSubmit = async (data) => {
    if (saving || !jobId || !selector?.user?.uid) return;
    setSaving(true);
    setFormError(null);
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
        jobId,
        sanitized,
        selector.user.uid,
      );
      if (!success) {
        throw new Error(apiError || 'Failed to update job.');
      }
      push('/employers-dashboard/manage-jobs');
    } catch (err) {
      setFormError(
        err.message || 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (forbidden) {
    return null;
  }

  if (!jobId) {
    return (
      <div className='form-group col-12'>
        <p style={{ color: 'red' }}>Invalid job link.</p>
        <Link href='/employers-dashboard/manage-jobs'>Terug naar vacatures</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <CircularLoader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className='form-group col-12'>
        <p style={{ color: 'red' }}>{error || 'Vacature niet gevonden.'}</p>
        <Link href='/employers-dashboard/manage-jobs'>Terug naar vacatures</Link>
      </div>
    );
  }

  if (sectorsLoading || jobTypesLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <CircularLoader />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
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
              placeholder='Titel'
              required={true}
              label='Functietitel'
              fieldType='Text'
              disabled={saving}
              defaultValue=''
            />
          </div>

          <div className='form-group col-lg-12 col-md-12'>
            <TextAreaField
              label='Beschrijving'
              name='description'
              placeholder='Beschrijf het type job'
              required
              disabled={saving}
            />
          </div>

          <div className='form-group col-lg-12 col-md-12'>
            <TextAreaField
              label='Functieomschrijving'
              name='functionDescription'
              placeholder='Beschrijf de functie in detail'
              required
              disabled={saving}
            />
          </div>

          <div className='form-group col-lg-12 col-md-12'>
            <TextAreaField
              label='Profiel/vaardigheden'
              name='profileSkills'
              placeholder='Beschrijf het gewenste profiel en vaardigheden'
              required
              disabled={saving}
            />
          </div>

          <div className='form-group col-lg-12 col-md-12'>
            <TextAreaField
              label='Aanbod'
              name='offer'
              placeholder='Beschrijf wat je aanbiedt (salaris, voordelen, etc.)'
              required
              disabled={saving}
            />
          </div>

          <div className='form-group col-lg-12 col-md-12'>
            <TextAreaField
              label='Uurrooster'
              name='schedule'
              placeholder='Beschrijf het uurrooster en werktijden'
              required
              disabled={saving}
            />
          </div>

          <div className='form-group col-lg-6 col-md-12'>
            <InputField
              label='E-mail'
              name='email'
              placeholder='kandidaat@email.be'
              required={true}
              fieldType='Email'
              disabled={true}
              defaultValue=''
            />
          </div>

          <div className='form-group col-lg-6 col-md-12'>
            <AutoSelect
              label='Type contract'
              name='job-type'
              options={jobTypeOptions}
              placeholder='Selecteer één of meer contracttypes'
              required
              defaultValue={[]}
              disabled={saving}
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
              disabled={saving}
            />
          </div>
          <div className='form-group col-lg-6 col-md-12'>
            <InputField
              label='Postcode'
              name='postalCode'
              placeholder='bijv. 2000'
              fieldType='Text'
              required={false}
              defaultValue=''
              disabled={saving}
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
              disabled={saving}
            />
          </div>
          <div className='form-group col-lg-6 col-md-12'>
            <InputField
              label='Salaris (optioneel)'
              name='salary'
              placeholder='bijv. 15-20 €/uur of 2500 €/maand'
              fieldType='Text'
              required={false}
              defaultValue=''
              disabled={saving}
            />
          </div>
          <div className='form-group col-lg-6 col-md-12'>
            <AutoSelect
              label='Job Tags'
              placeholder='Selecteer Tags'
              name='tags'
              options={sectors}
              required
              disabled={saving}
            />
          </div>

          {formError && (
            <div className='form-group col-12' style={{ color: 'red' }}>
              {formError}
            </div>
          )}

          <div className='form-group col-lg-12 col-md-12 text-right'>
            <Link
              href='/employers-dashboard/manage-jobs'
              className='theme-btn btn-style-two'
              style={{ marginRight: 12 }}
            >
              Annuleren
            </Link>
            <button
              className={`theme-btn ${
                saving ? 'btn-style-three' : 'btn-style-one'
              }`}
              disabled={saving}
              type='submit'
            >
              {saving ? (
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <CircularLoader />
                  <p style={{ margin: 0 }}>Opslaan...</p>
                </div>
              ) : (
                'Wijzigingen opslaan'
              )}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditEmployerJobForm;
