"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { useFormState } from "react-dom";
import { updateProfile } from "@/app/lib/actions";
// import { deleteAccountAction } from "./delete-account-action";
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
export function ProfileForm({ profileAvatarUrl }: { profileAvatarUrl?: string }) {
  const [state, formAction] = React.useActionState(updateProfile, null);
  const { user, refreshUser } = useAuth();
  const [fileError, setFileError] = useState<string | null>(null);

  // Change password modal state and logic
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwLoading, setChangePwLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangePwError(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setChangePwError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setChangePwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePwError("Passwords do not match.");
      return;
    }
    setChangePwLoading(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChangePwError(data.error || "Failed to change password.");
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowChangePassword(false);
      }
    } catch (err: any) {
      setChangePwError("Unexpected error. Please try again.");
    } finally {
      setChangePwLoading(false);
    }
  }

  useEffect(() => {
    if (state && (!state.errors || Object.keys(state.errors).length === 0)) {
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
                  <Label htmlFor="gmail">Gmail Address</Label>
                  <Input
                    type="email"
                    id="gmail"
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
                      accept="image/png,image/jpeg,image/webp"
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
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    type="password"
                    id="current_password"
                    name="current_password"
                    placeholder="Enter your current password to save changes"
                  />
                  {state && getErrorMessages(state.errors, "current_password").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "current_password").join(", ")}
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
            <Label htmlFor="account-email">Email</Label>
            <Input
              type="email"
              id="account-email"
              name="email"
              defaultValue={user?.email || ""}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Button variant="outline" type="button" onClick={() => setShowChangePassword(true)}>Change Password</Button>
          </div>
          <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
                </div>
                {changePwError && <p className="text-sm text-red-500">{changePwError}</p>}
                <DialogFooter>
                  <Button type="submit" disabled={changePwLoading}>{changePwLoading ? "Changing..." : "Change Password"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
            <form
              action="/settings/delete-account-action"
              method="post"
              onSubmit={e => {
                const confirmed = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
                if (!confirmed) {
                  e.preventDefault();
                }
              }}
            >
              <Button variant="destructive" type="submit">Delete Account</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

