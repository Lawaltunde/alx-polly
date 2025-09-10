"use client";

import { useFormState } from "react-dom";
import { updateProfile } from "@/app/lib/actions";
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
import { useEffect, useState } from "react";
import React from "react";
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
  const [state, formAction] = useFormState(updateProfile, null);
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    type="text"
                    id="username"
                    name="username"
                    defaultValue={user?.user_metadata?.user_name || ""}
                  />
                  {state && getErrorMessages(state.errors, "username").length > 0 && (
                    <p className="text-sm text-red-500">
                      {getErrorMessages(state.errors, "username").join(", ")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a little about yourself"
                    defaultValue={user?.user_metadata?.bio || ""}
                  />
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
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Profile</Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage your notification preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails about your account activity.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push_notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive push notifications on your devices.
            </p>
          </div>
        </CardContent>
      </Card>

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
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
