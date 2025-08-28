"use client";

import { useFormState } from "react-dom";
import { updatePoll } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function EditPollForm({ poll }: { poll: any }) {
  const initialState = { errors: {}, message: null };
  const updatePollWithId = updatePoll.bind(null, poll.id);
  const [state, dispatch] = useFormState(updatePollWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="mb-4">
        <Label htmlFor="question">Question</Label>
        <Input id="question" name="question" defaultValue={poll.question} />
        {state.errors?.question &&
          state.errors.question.map((error: string) => (
            <p className="text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
      <div className="mb-4">
        <Label>Options</Label>
        {poll.options.map((option: any, index: number) => (
          <div key={index} className="flex items-center mb-2">
            <Input name={`options`} defaultValue={option.text} />
          </div>
        ))}
        {state.errors?.options &&
          state.errors.options.map((error: string) => (
            <p className="text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="requires-authentication">Requires Authentication</Label>
        <Switch
          id="requires-authentication"
          name="requiresAuthentication"
          defaultChecked={poll.requiresAuthentication}
        />
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
}