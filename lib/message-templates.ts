import { DentalClinic } from './dental-data';
import { generateSlug } from './slug-generator';
import { ensureClinicHasSlug } from './slug-updater';

export interface MessageTemplate {
  whatsapp: string;
  sms: string;
  email: {
    subject: string;
    body: string;
  };
}

export const defaultMessageTemplate: MessageTemplate = {
  whatsapp: `Hi {clinicName},

This is Tijwa Limited. We found your clinic while searching online and created a quick demo website showing how it could appear.

Preview:
{previewLink}

Would love your feedback.`,
  
  sms: `Hi {clinicName}, this is Tijwa Limited. While searching online for dental clinics we found your practice and created a quick website demo for you: {previewLink}`,
  
  email: {
    subject: 'Free Website Demo for {clinicName}',
    body: `Hi {clinicName} Team,

This is Tijwa Limited. We found your clinic while searching online and created a quick demo website showing how it could appear.

Preview: {previewLink}

Would love your feedback.

Best regards,
Tijwa Limited Team`
  }
};

export interface ClinicWithActions extends DentalClinic {
  id: string;
}

export async function generatePreviewLink(clinic: ClinicWithActions): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Ensure clinic has a slug (updates existing clinics if needed)
  const updatedClinic = await ensureClinicHasSlug(clinic);
  
  // Use the slug (either existing or newly generated)
  return `${baseUrl}/preview/${updatedClinic.slug}`;
}

export async function formatMessage(template: string, clinic: ClinicWithActions): Promise<string> {
  const previewLink = await generatePreviewLink(clinic);
  return template
    .replace(/{clinicName}/g, clinic.name || 'Your Clinic')
    .replace(/{previewLink}/g, previewLink);
}

export async function formatEmailMessage(template: MessageTemplate['email'], clinic: ClinicWithActions) {
  const previewLink = await generatePreviewLink(clinic);
  return {
    subject: template.subject.replace(/{clinicName}/g, clinic.name || 'Your Clinic'),
    body: template.body
      .replace(/{clinicName}/g, clinic.name || 'Your Clinic')
      .replace(/{previewLink}/g, previewLink)
  };
}

// Synchronous versions for immediate use (fallback to generated slug without saving)
export function generatePreviewLinkSync(clinic: ClinicWithActions): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // If clinic has a slug, use it
  if (clinic.slug) {
    return `${baseUrl}/preview/${clinic.slug}`;
  }
  
  // For existing clinics without slug, generate one but don't save it
  const generatedSlug = generateSlug(clinic.name || '', clinic.city);
  return `${baseUrl}/preview/${generatedSlug}`;
}

export function formatMessageSync(template: string, clinic: ClinicWithActions): string {
  const previewLink = generatePreviewLinkSync(clinic);
  return template
    .replace(/{clinicName}/g, clinic.name || 'Your Clinic')
    .replace(/{previewLink}/g, previewLink);
}

export function formatEmailMessageSync(template: MessageTemplate['email'], clinic: ClinicWithActions) {
  const previewLink = generatePreviewLinkSync(clinic);
  return {
    subject: template.subject.replace(/{clinicName}/g, clinic.name || 'Your Clinic'),
    body: template.body
      .replace(/{clinicName}/g, clinic.name || 'Your Clinic')
      .replace(/{previewLink}/g, previewLink)
  };
}
