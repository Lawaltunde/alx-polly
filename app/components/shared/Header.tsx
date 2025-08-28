import Link from "next/link";
import { ThemeSwitcher } from "./ThemeSwitcher";

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 bg-transparent">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        <Link href="/">Polly</Link>
      </h1>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
      </div>
    </header>
  );
}