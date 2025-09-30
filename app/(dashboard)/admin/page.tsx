import { requireAdmin } from '@/app/lib/auth';
import Link from 'next/link';
import { listPollsForAdmin } from '@/app/lib/supabase/server-queries';
import { deletePollAction } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';

export default async function AdminPage({ searchParams }: { searchParams?: any }) {
  await requireAdmin();

  const sp = searchParams && typeof searchParams.then === 'function' ? await searchParams : (searchParams ?? {});
  const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
  const q = Array.isArray(sp.q) ? sp.q[0] : ((sp.q ?? '') as string);
  const status = (Array.isArray(sp.status) ? sp.status[0] : sp.status) as 'open' | 'closed' | undefined;
  const owner = Array.isArray(sp.owner) ? sp.owner[0] : ((sp.owner ?? '') as string);
  const sortParam = Array.isArray(sp.sort) ? sp.sort[0] : ((sp.sort ?? 'created_at') as string);
  const dirParam = Array.isArray(sp.dir) ? sp.dir[0] : ((sp.dir ?? 'desc') as string);
  const sort: 'created_at' | 'question' | 'status' =
    sortParam === 'question' || sortParam === 'status' ? (sortParam as any) : 'created_at';
  const dir: 'asc' | 'desc' = dirParam === 'asc' ? 'asc' : 'desc';

  const { items, pageCount, total } = await listPollsForAdmin({
    page,
    pageSize: 10,
    q,
    status: status ?? null,
    ownerUsername: owner ? owner : null,
    sort,
    dir,
  });

  const buildQuery = (next: Partial<{ page: number; q: string; status: string; owner: string; sort: string; dir: string }>) => {
    const params = new URLSearchParams();
    const merged = {
      page: next.page ?? page,
      q: next.q ?? q ?? '',
      status: next.status ?? (status ?? ''),
      owner: next.owner ?? owner ?? '',
      sort: next.sort ?? sort,
      dir: next.dir ?? dir,
    };
    if (merged.page && merged.page !== 1) params.set('page', String(merged.page));
    if (merged.q) params.set('q', merged.q);
    if (merged.status) params.set('status', merged.status);
    if (merged.owner) params.set('owner', merged.owner);
    if (merged.sort && merged.sort !== 'created_at') params.set('sort', merged.sort);
    if (merged.dir && merged.dir !== 'desc') params.set('dir', merged.dir);
    const s = params.toString();
    return `/admin${s ? `?${s}` : ''}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Panel</h1>

      <form className="mb-4 flex flex-wrap gap-2" action="/admin" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search question..."
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
          aria-label="Search polls"
        />
        <input
          type="text"
          name="owner"
          defaultValue={owner}
          placeholder="Owner username"
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
          aria-label="Filter by owner username"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="px-3 py-2 rounded-md border border-border bg-background text-foreground"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        {/* Preserve current sort/dir when submitting filters */}
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-2">
                  <Link href={buildQuery({ sort: 'question', dir: sort === 'question' ? (dir === 'asc' ? 'desc' : 'asc') : 'asc', page: 1 })} className="hover:underline">
                    Question{sort === 'question' ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </Link>
                </th>
                <th className="px-4 py-2">Owner</th>
                <th className="px-4 py-2">
                  <Link href={buildQuery({ sort: 'status', dir: sort === 'status' ? (dir === 'asc' ? 'desc' : 'asc') : 'asc', page: 1 })} className="hover:underline">
                    Status{sort === 'status' ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </Link>
                </th>
                <th className="px-4 py-2">Votes</th>
                <th className="px-4 py-2">
                  <Link href={buildQuery({ sort: 'created_at', dir: sort === 'created_at' ? (dir === 'asc' ? 'desc' : 'asc') : 'desc', page: 1 })} className="hover:underline">
                    Created{sort === 'created_at' ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}
                  </Link>
                </th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-muted-foreground" colSpan={6}>No polls found.</td>
                </tr>
              )}
              {items.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <Link href={`/polls/${p.id}`} className="hover:underline">{p.question}</Link>
                  </td>
                  <td className="px-4 py-3">{p.owner_username ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{p.status}</td>
                  <td className="px-4 py-3">{p.total_votes}</td>
                  <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/polls/${p.id}`} className="text-sm underline">View</Link>
                      <form action={deletePollAction}>
                        <input type="hidden" name="pollId" value={p.id} />
                        <input type="hidden" name="redirectTo" value="/admin" />
                        <Button type="submit" variant="destructive" size="sm" aria-label={`Delete poll ${p.question}`}>Delete</Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    <div className="flex items-center justify-between p-3 text-sm text-muted-foreground">
          <span>Total: {total}</span>
          <div className="flex gap-2">
      <PaginationLink page={Math.max(1, page - 1)} disabled={page <= 1} q={q} status={status} owner={owner} sort={sort} dir={dir}>
              Previous
            </PaginationLink>
            <span>
              Page {page} of {Math.max(1, pageCount)}
            </span>
      <PaginationLink page={page + 1} disabled={pageCount !== 0 && page >= pageCount} q={q} status={status} owner={owner} sort={sort} dir={dir}>
              Next
            </PaginationLink>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationLink({ page, q, status, owner, sort, dir, disabled, children }: {
  page: number;
  q?: string;
  status?: string;
  owner?: string;
  sort?: string;
  dir?: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (page && page > 0) params.set('page', String(page));
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (owner) params.set('owner', owner);
  if (sort) params.set('sort', sort);
  if (dir) params.set('dir', dir);
  const href = `/admin?${params.toString()}`;
  if (disabled) {
    return <span className="px-3 py-1 rounded border border-border bg-muted text-muted-foreground opacity-60 cursor-not-allowed">{children}</span>;
  }
  return (
    <Link href={href} className="px-3 py-1 rounded border border-border hover:bg-muted">
      {children}
    </Link>
  );
}
