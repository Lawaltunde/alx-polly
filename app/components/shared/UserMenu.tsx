"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import LogoutButton from "@/app/ui/logout-button";
import Link from "next/link";

/**
 * A user menu component that displays user information and navigation links.
 * This component is crucial for user interaction, providing access to key areas
 * like the polls dashboard and settings. It also handles the display of
 * authentication status, showing either a logout button or a login link.
 * 
 * @returns {JSX.Element} The rendered user menu component.
 */
export function UserMenu() {
  // The useAuth hook provides the current user's authentication state.
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          {/* The user's avatar image is displayed here. A fallback is used if the image is not available. */}
          <AvatarImage
            src={user?.user_metadata?.avatar_url ?? undefined}
            alt={
              user?.user_metadata?.user_name
                ? `${user.user_metadata.user_name} avatar`
                : "User avatar"
            }
          />
          <AvatarFallback>
            {user?.user_metadata?.user_name?.[0]?.toUpperCase() ??
              user?.email?.[0]?.toUpperCase() ??
              "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {user ? (
          // If the user is authenticated, display their email and navigation links.
          <>
            <DropdownMenuLabel>
              {user.user_metadata.user_name ?? user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/polls">Polls</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* The LogoutButton component handles the sign-out process. */}
            <LogoutButton />
          </>
        ) : (
          // If the user is not authenticated, display a link to the login page.
          <DropdownMenuItem asChild>
            <Link href="/login">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}