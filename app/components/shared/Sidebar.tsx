import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 p-4 bg-white border-r dark:bg-gray-800 dark:border-gray-700">
      <nav className="flex flex-col space-y-2">
        <Link href="/polls" className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Dashboard</Link>
        <Link href="/polls/new" className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">New Poll</Link>
        <Link href="/settings" className="px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">Settings</Link>
      </nav>
    </aside>
  );
}