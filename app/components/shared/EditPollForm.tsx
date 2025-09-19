"use client";

import { useFormState } from "react-dom";
import { updatePoll } from "@/app/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PollWithDetails } from "@/app/lib/types";

export default function EditPollForm({ poll }: { poll: PollWithDetails }) {
  const initialState = { errors: {} as Record<string, string[]> };
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
        {poll.poll_options?.map((option, index: number) => (
          <div key={option.id} className="flex items-center mb-2">
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
          name="requireAuth"
          defaultChecked={poll.require_auth}
        />
      </div>
      <div className="flex items-center justify-between mb-6">
        <Label htmlFor="single-vote">Single vote per user</Label>
        <Switch
          id="single-vote"
          name="singleVote"
          defaultChecked={poll.single_vote}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="visibility">Poll visibility</Label>
        <select
          id="visibility"
          name="visibility"
          defaultValue={poll.visibility || 'public'}
          className="mt-2 w-full rounded border p-2 bg-background"
        >
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </div>
      <div className="mb-6">
        <Label htmlFor="results_visibility">Results visibility</Label>
        <select
          id="results_visibility"
          name="results_visibility"
          defaultValue={poll.results_visibility || 'public'}
          className="mt-2 w-full rounded border p-2 bg-background"
        >
          <option value="public">Public</option>
          <option value="after_close">After poll closes</option>
          <option value="owner_only">Owner only</option>
        </select>
      </div>
      <Button type="submit">Save Changes</Button>
    </form>
  );
}