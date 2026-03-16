import { DentalClinic } from './dental-data';
import { formatEmailMessageSync } from './message-templates';
import { defaultMessageTemplate, MessageTemplate } from './message-templates';

export function generateBulkEmailContent(clinics: DentalClinic[], template: MessageTemplate = defaultMessageTemplate) {
  const clinicsWithEmail = clinics.filter(c => c.email);
  
  if (clinicsWithEmail.length === 0) {
    return null;
  }

  if (clinicsWithEmail.length === 1) {
    // Single email
    const clinic = clinicsWithEmail[0];
    const emailData = formatEmailMessageSync(template.email, clinic);
    return {
      to: clinic.email!,
      subject: emailData.subject,
      body: emailData.body,
      isSingle: true
    };
  }

  // Multiple emails - create separate email links
  return {
    multipleEmails: clinicsWithEmail.map(clinic => {
      const emailData = formatEmailMessageSync(template.email, clinic);
      return {
        to: clinic.email!,
        subject: emailData.subject,
        body: emailData.body,
        clinicName: clinic.name
      };
    }),
    isSingle: false
  };
}

export function openBulkEmail(
  clinics: DentalClinic[],
  template: MessageTemplate = defaultMessageTemplate
) {
  const emailContent = generateBulkEmailContent(clinics, template);

  if (!emailContent) {
    alert('None of the selected clinics have email addresses');
    return;
  }

  const buildMailto = (to?: string, subject?: string, body?: string) => {
    const safeTo = to ?? '';
    const safeSubject = subject ?? '';
    const safeBody = body ?? '';

    return `mailto:${encodeURIComponent(safeTo)}?subject=${encodeURIComponent(
      safeSubject
    )}&body=${encodeURIComponent(safeBody)}`;
  };

  if (emailContent.isSingle) {
    const { to, subject, body } = emailContent;

    window.open(buildMailto(to, subject, body), '_blank');
  } else {
    const firstEmail = emailContent.multipleEmails![0];

    window.open(
      buildMailto(firstEmail.to, firstEmail.subject, firstEmail.body),
      '_blank'
    );

    if (emailContent.multipleEmails!.length > 1) {
      setTimeout(() => {
        alert(
          `Email opened for ${firstEmail.clinicName}. You'll need to send emails for the remaining ${
            emailContent.multipleEmails!.length - 1
          } clinics individually.`
        );
      }, 1000);
    }
  }
}