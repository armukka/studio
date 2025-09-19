import EmailView from '@/components/email-view';
import { type Email } from '@/lib/types';

// Mock data for demonstration
const mockEmail: Email = {
  id: '12345',
  from: 'admin@ciphermail.com',
  to: 'recipient@example.com',
  subject: 'Confidential Project Files',
  body: `
<p>Hello,</p>
<p>Please find the attached confidential project files. This email and its attachments are encrypted for your security.</p>
<p>You can download the attachments directly from this secure view. To reply, please use the form below.</p>
<p>Best regards,<br/>CipherMail Admin</p>
  `,
  attachments: [
    { name: 'project-brief-encrypted.pdf', size: '2.3 MB' },
    { name: 'design-mockups-encrypted.zip', size: '15.7 MB' },
  ],
  timestamp: new Date().toISOString(),
};

export default function EmailPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch email data using params.id
  const emailData = { ...mockEmail, id: params.id };

  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl">
        <EmailView email={emailData} />
      </div>
    </main>
  );
}
