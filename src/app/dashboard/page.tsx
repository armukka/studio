import { ComposeEmailForm } from '@/components/compose-email-form';

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Compose Secure Email</h1>
      <ComposeEmailForm />
    </div>
  );
}
