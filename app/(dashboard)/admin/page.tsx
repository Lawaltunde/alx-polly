import { requireAdmin } from '@/app/lib/auth';

export default async function AdminPage() {
  await requireAdmin();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin</h1>
      <p className="text-muted-foreground">Welcome, admin. More tools coming soon.</p>
    </div>
  );
}
