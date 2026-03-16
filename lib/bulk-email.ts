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

export function openBulkEmail(clinics: DentalClinic[], template: MessageTemplate = defaultMessageTemplate) {
  const emailContent = generateBulkEmailContent(clinics, template);
  
  if (!emailContent) {
    alert('None of the selected clinics have email addresses');
    return;
  }

  if (emailContent.isSingle) {
    // Open single email
    const { to, subject, body } = emailContent;
    window.open(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  } else {
    // Open first email and show alert for remaining
    const firstEmail = emailContent.multipleEmails![0];
    window.open(`mailto:${encodeURIComponent(firstEmail.to)}?subject=${encodeURIComponent(firstEmail.subject)}&body=${encodeURIComponent(firstEmail.body)}`, '_blank');
    
    if (emailContent.multipleEmails!.length > 1) {
      setTimeout(() => {
        alert(`Email opened for ${firstEmail.clinicName}. You'll need to send emails for the remaining ${emailContent.multipleEmails!.length - 1} clinics individually.`);
      }, 1000);
    }
  }
}
