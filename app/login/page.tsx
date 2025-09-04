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
import { login } from "@/app/lib/actions";

const initialState = {
  errors: {} as Record<string, string[]>,
};

export default function LoginPage() {
  const [state, dispatch] = useFormState(login, initialState);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <form action={dispatch}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Welcome Back!</CardTitle>
            <CardDescription>
              Enter your credentials to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-2">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  className="py-6"
                />
                {state.errors?.email && (
                  <p className="text-sm text-red-500">{state.errors.email}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="py-6"
                />
                {state.errors?.password && (
                  <p className="text-sm text-red-500">
                    {state.errors.password}
                  </p>
                )}
              </div>
              {state.errors?.general && (
                <p className="text-sm text-red-500">
                  {state.errors.general.join(", ")}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4">
            <Button type="submit" className="w-full py-6">
              Login
            </Button>
            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <a href="/auth/signup" className="underline">
                Sign up
              </a>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}