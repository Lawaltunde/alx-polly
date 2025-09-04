"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormState } from "react-dom";
import { signup } from "@/app/lib/actions";

const initialState = {
  errors: {} as Record<string, string[]>,
};

export default function SignupPage() {
  const [state, dispatch] = useFormState(signup, initialState);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <form action={dispatch}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Enter your information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="py-6"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="py-6"
              />
              {state.errors?.password && (
                <p className="text-sm text-red-500">{state.errors.password}</p>
              )}
            </div>
            {state.errors?.general && (
              <p className="text-sm text-red-500">
                {state.errors.general.join(", ")}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full py-6">
              Create account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}