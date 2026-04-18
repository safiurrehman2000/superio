import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/utils/firebase-admin';
import { sanitizeEmail, sanitizeFormData } from '@/utils/sanitization';
import { sendEmployerApplicationNotificationBrevo } from '@/utils/brevo-email-service';

async function resolveEmployerNotificationEmail(employerId, jobData) {
  const jobContact = sanitizeEmail(jobData?.email);

  if (!employerId) {
    return {
      email: jobContact || null,
      employerName: '',
      source: jobContact ? 'job' : null,
    };
  }

  const employerSnap = await adminDb.collection('users').doc(employerId).get();
  const employerData = employerSnap.exists ? employerSnap.data() || {} : {};
  const employerName = employerData.name || employerData.company_name || '';

  const fromProfile = sanitizeEmail(employerData.email);
  if (fromProfile) {
    return { email: fromProfile, employerName, source: 'firestore' };
  }

  try {
    const userRecord = await adminAuth.getUser(employerId);
    const fromAuth = sanitizeEmail(userRecord.email);
    if (fromAuth) {
      return { email: fromAuth, employerName, source: 'auth' };
    }
  } catch (authErr) {
    console.error(
      'resolveEmployerNotificationEmail: Firebase Auth getUser failed:',
      authErr?.message || authErr,
    );
  }

  if (jobContact) {
    return { email: jobContact, employerName, source: 'job' };
  }

  console.error(
    'resolveEmployerNotificationEmail: No email found for employer',
    employerId,
  );
  return { email: null, employerName, source: null };
}

export async function POST(request) {
  try {
    const { candidateId, jobId, resumeId, message } = await request.json();

    if (!candidateId || !jobId) {
      return NextResponse.json(
        { success: false, error: 'candidateId and jobId are required' },
        { status: 400 },
      );
    }

    const fieldTypes = {
      candidateId: 'candidateid',
      jobId: 'text',
      resumeId: 'text',
      message: 'description',
    };
    const sanitizedPayload = sanitizeFormData(
      { candidateId, jobId, resumeId: resumeId || '', message: message || '' },
      fieldTypes,
    );

    if (!sanitizedPayload.candidateId || !sanitizedPayload.jobId) {
      return NextResponse.json(
        { success: false, error: 'Invalid application data' },
        { status: 400 },
      );
    }

    const existingSnap = await adminDb
      .collection('applications')
      .where('candidateId', '==', sanitizedPayload.candidateId)
      .where('jobId', '==', sanitizedPayload.jobId)
      .limit(1)
      .get();
    if (!existingSnap.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job.' },
        { status: 409 },
      );
    }

    const applicationRef = await adminDb.collection('applications').add({
      candidateId: sanitizedPayload.candidateId,
      jobId: sanitizedPayload.jobId,
      resumeId: sanitizedPayload.resumeId || null,
      message: sanitizedPayload.message || '',
      appliedAt: Date.now(),
      status: 'Active',
    });

    let employerEmailSent = false;
    let employerEmail = null;
    let employerEmailSource = null;
    let emailError = null;
    let brevoErrorMessage = null;
    let brevoErrorCode = null;
    try {
      const [jobSnap, candidateSnap] = await Promise.all([
        adminDb.collection('jobs').doc(sanitizedPayload.jobId).get(),
        adminDb.collection('users').doc(sanitizedPayload.candidateId).get(),
      ]);

      if (jobSnap.exists) {
        const jobData = jobSnap.data() || {};
        const employerId = jobData.employerId;
        const candidateData = candidateSnap.exists
          ? candidateSnap.data() || {}
          : {};

        let resumeFileName = '';
        if (sanitizedPayload.resumeId) {
          const resumeSnap = await adminDb
            .collection('users')
            .doc(sanitizedPayload.candidateId)
            .collection('resumes')
            .doc(sanitizedPayload.resumeId)
            .get();
          if (resumeSnap.exists) {
            const resumeData = resumeSnap.data() || {};
            resumeFileName = resumeData.fileName || '';
          }
        }

        const {
          email: resolvedEmployerEmail,
          employerName,
          source,
        } = await resolveEmployerNotificationEmail(employerId, jobData);
        employerEmail = resolvedEmployerEmail || null;
        employerEmailSource = source || null;

        if (resolvedEmployerEmail) {
          console.log(
            `📧 Employer notify: sending to ${resolvedEmployerEmail} (source: ${source})`,
          );
          const notifyResult = await sendEmployerApplicationNotificationBrevo(
            resolvedEmployerEmail,
            employerName,
            {
              candidateName: candidateData.name || 'Candidate',
              candidateEmail: candidateData.email || '',
              jobTitle: jobData.title || 'your job posting',
              candidateMessage: sanitizedPayload.message || '',
              resumeFileName,
              applicationId: applicationRef.id,
            },
          );
          employerEmailSent = Boolean(notifyResult?.success);
          if (!employerEmailSent) {
            brevoErrorMessage = notifyResult?.errorMessage || null;
            brevoErrorCode = notifyResult?.errorCode || null;
            emailError = brevoErrorMessage
              ? `BREVO_SEND_FAILED: ${brevoErrorMessage}`
              : 'BREVO_SEND_FAILED';
            console.error(
              '⚠️ Brevo employer notification failed:',
              brevoErrorCode,
              brevoErrorMessage,
            );
          }
        } else {
          emailError = 'NO_EMPLOYER_EMAIL_RESOLVED';
          console.error(
            '⚠️ No employer email resolved (missing employerId on job, user profile, Auth, and job contact email)',
          );
        }
      }
    } catch (emailSendError) {
      emailError = emailSendError?.message || 'UNKNOWN_EMAIL_ERROR';
      console.error(
        '⚠️ Application saved but employer email failed:',
        emailSendError,
      );
    }

    await applicationRef.update({
      employerEmailSent,
      employerEmail: employerEmail || null,
      employerEmailSource: employerEmailSource || null,
      emailError: emailError || null,
      brevoErrorMessage: brevoErrorMessage || null,
      brevoErrorCode: brevoErrorCode || null,
      emailAttemptedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      applicationId: applicationRef.id,
      employerEmailSent,
      employerEmail: employerEmail || null,
      employerEmailSource: employerEmailSource || null,
      emailError: emailError || null,
      brevoErrorMessage: brevoErrorMessage || null,
      brevoErrorCode: brevoErrorCode || null,
    });
  } catch (error) {
    console.error('💥 Error creating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit application' },
      { status: 500 },
    );
  }
}
