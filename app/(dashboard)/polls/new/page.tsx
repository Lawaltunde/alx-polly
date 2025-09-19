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
import { toast } from "sonner";
import { X } from "lucide-react";

const initialState = {
  errors: {} as Record<string, string[]>,
  success: false,
  poll: null,
};

export default function NewPollPage() {
  const [state, dispatch] = useFormState(createPoll, initialState);
  const [options, setOptions] = useState(["", ""]);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.poll) {
      toast.success("Poll created successfully!");
      router.push(`/polls`);
    }
  }, [state, router]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (formData: FormData) => {
    options.forEach((option) => {
      formData.append("options", option);
    });
    dispatch(formData);
  };

  return (
    <div className="flex justify-center items-center h-full bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-2xl shadow-lg">
        <form action={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create a New Poll</CardTitle>
            <CardDescription>
              Fill out the details below to create your poll.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question" className="text-sm font-medium">Question</Label>
              <Input
                id="question"
                name="question"
                placeholder="What's your favorite color?"
                className="mt-1"
              />
              {"question" in state.errors && Array.isArray((state.errors as any).question) && (
                <p className="text-sm text-red-500">{(state.errors as any).question.join(", ")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {"options" in state.errors && Array.isArray((state.errors as any).options) && (
                <p className="text-sm text-red-500">
                  {(state.errors as any).options.filter((o: string) => o).join(", ")}
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
            <div className="mt-4 space-y-2">
              <Label htmlFor="visibility">Poll visibility</Label>
              <select
                id="visibility"
                name="visibility"
                defaultValue="public"
                className="mt-1 w-full rounded border p-2 bg-background"
              >
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="results_visibility">Results visibility</Label>
              <select
                id="results_visibility"
                name="results_visibility"
                defaultValue="public"
                className="mt-1 w-full rounded border p-2 bg-background"
              >
                <option value="public">Public</option>
                <option value="after_close">After poll closes</option>
                <option value="owner_only">Owner only</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit">Create Poll</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}