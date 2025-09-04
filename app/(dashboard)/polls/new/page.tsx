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
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { createPoll } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

const initialState = {
  errors: {} as Record<string, string[]>,
  success: false,
};

export default function NewPollPage() {
  const [state, dispatch] = useFormState(createPoll, initialState);
  const [options, setOptions] = useState(["", ""]);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/polls");
    }
  }, [state.success, router]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-2xl">
        <form action={dispatch}>
          <CardHeader>
            <CardTitle>Create a New Poll</CardTitle>
            <CardDescription>
              Fill out the details below to create your poll.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  name="question"
                  placeholder="What's your favorite color?"
                />
                {state.errors?.question && (
                  <p className="text-sm text-red-500">{state.errors.question}</p>
                )}
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <Input
                    key={index}
                    name="options"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
                {state.errors?.options && (
                  <p className="text-sm text-red-500">
                    {state.errors.options.filter((o) => o).join(", ")}
                  </p>
                )}
              </div>
              <Button type="button" variant="outline" onClick={handleAddOption}>
                Add Option
              </Button>
              <div className="flex items-center space-x-2 mt-4">
                <input type="checkbox" id="requireAuth" name="requireAuth" />
                <Label htmlFor="requireAuth">Require authentication to vote</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="singleVote" name="singleVote" />
                <Label htmlFor="singleVote">One vote per user</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button type="submit">Create Poll</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}