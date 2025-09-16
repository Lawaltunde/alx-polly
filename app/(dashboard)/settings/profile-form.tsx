"use client";
import React, { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { updateProfile } from "@/app/lib/actions";
import { deleteAccountAction } from "./delete-account-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

function getErrorMessages(errors: any, field: string): string[] {
  if (
    errors &&
    typeof errors === "object" &&
    field in errors &&
    Array.isArray(errors[field])
  ) {
    return errors[field];
  }
  return [];
}

export function ProfileForm({
  profileAvatarUrl,
}: {
  profileAvatarUrl?: string;
}) {
  const [state, formAction] = React.useActionState(updateProfile, null);
  const { user, refreshUser } = useAuth();
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (state?.message) {
      refreshUser();
    }
  }, [state, refreshUser]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > 1024 * 1024) {
      setFileError("Image size must not exceed 1 MB.");
    } else {
      setFileError(null);
    }
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (fileError) {
      e.preventDefault();
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form action={formAction} onSubmit={handleFormSubmit}>
          <CardHeader>
            <CardTitle>Public Profile</CardTitle>
            <CardDescription>
              This information will be displayed publicly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <div>Loading...</div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    type="text"
                    id="first_name"
                    name="first_name"
                    defaultValue={user?.user_metadata?.first_name || ""}
                  />
                  {state && getErrorMessages(state.errors, "first_name").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "first_name").join(", ")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    type="text"
                    id="last_name"
                    name="last_name"
                    defaultValue={user?.user_metadata?.last_name || ""}
                  />
                  {state && getErrorMessages(state.errors, "last_name").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "last_name").join(", ")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Gmail Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={user?.email || ""}
                  />
                  {state && getErrorMessages(state.errors, "email").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "email").join(", ")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_picture">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={
                          profileAvatarUrl ||
                          user?.user_metadata?.avatar_url ||
                          undefined
                        }
                        alt="User avatar"
                      />
                      <AvatarFallback>
                        {user?.email?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Input
                      type="file"
                      id="profile_picture"
                      name="profile_picture"
                      onChange={handleFileChange}
                    />
                  </div>
                  {fileError && (
                    <p className="text-sm text-red-500">{fileError}</p>
                  )}
                  {state &&
                    getErrorMessages(state.errors, "profile_picture").length >
                      0 && (
                      <p className="text-sm text-red-500">
                        {getErrorMessages(
                          state.errors,
                          "profile_picture"
                        ).join(", ")}
                      </p>
                    )}
                  {state &&
                    getErrorMessages(state.errors, "_form").length > 0 && (
                      <p className="text-sm text-red-500">
                        {getErrorMessages(state.errors, "_form").join(", ")}
                      </p>
                    )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter new password"
                  />
                  {state && getErrorMessages(state.errors, "password").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "password").join(", ")}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit">Save</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              defaultValue={user?.email || ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

  {/* Notifications card removed as it was non-functional */}

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            These actions are permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Export Account Data</h3>
              <p className="text-sm text-muted-foreground">
                Download a copy of your account data.
              </p>
            </div>
            <Button variant="outline">Export Data</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600">Delete Account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <form action={deleteAccountAction} method="post">
              <Button variant="destructive" type="submit">Delete Account</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
