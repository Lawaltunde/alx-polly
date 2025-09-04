import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { getCurrentUser } from "@/app/lib/auth";
import UserMenu from "@/app/components/shared/UserMenu";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        <Link href="/">Polly</Link>
      </h1>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
        <UserMenu user={user} />
      </div>
    </header>
  );
}