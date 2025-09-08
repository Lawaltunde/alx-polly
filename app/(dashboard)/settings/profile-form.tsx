
"use client";

import { useFormState } from "react-dom";
import { updateProfile } from "@/app/lib/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export function ProfileForm() {
  const [state, formAction] = useFormState(updateProfile, null);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    if (state?.message) {
      refreshUser();
    }
  }, [state, refreshUser]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <form action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_picture">Profile Picture</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={user.user_metadata.avatar_url}
                  alt="User avatar"
                />
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <Input type="file" id="profile_picture" name="profile_picture" />
            </div>
            {state?.errors?.profile_picture && (
              <p className="text-sm text-red-500">
                {state.errors.profile_picture}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              defaultValue={user.email}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              defaultValue={user.user_metadata.user_name}
            />
            {state?.errors?.username && (
              <p className="text-sm text-red-500">{state.errors.username}</p>
            )}
          </div>
          <Button type="submit">Update Profile</Button>
        </CardContent>
      </Card>
    </form>
  );
}