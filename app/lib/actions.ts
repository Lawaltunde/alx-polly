"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addPoll, getPoll, removePoll, submitVote } from "./data";
import { setSession, clearSession, isAuthenticated } from "./auth";

const pollSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  requireAuth: z.boolean(),
  singleVote: z.boolean(),
});

export async function createPoll(prevState: any, formData: FormData) {
  const validatedFields = pollSchema.safeParse({
    question: formData.get("question"),
    options: formData.getAll("options").filter((o) => o !== ""),
    requireAuth: formData.get("requireAuth") === "on",
    singleVote: formData.get("singleVote") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const poll = {
    id: Math.random().toString(36).substring(7),
    question: validatedFields.data.question,
    options: validatedFields.data.options.map((option) => ({ text: option, votes: 0 })),
    createdAt: new Date(),
    createdBy: "user",
    requireAuth: validatedFields.data.requireAuth,
    singleVote: validatedFields.data.singleVote,
    status: "open",
  };

  await addPoll(poll);

  revalidatePath("/polls");
  redirect(`/polls/${poll.id}`);
}

export async function handleVote(
  pollId: string,
  source: "dashboard" | "public",
  formData: FormData
) {
  const poll = await getPoll(pollId);
  if (!poll || poll.status === "closed") {
    // Handle poll not found or closed
    return;
  }

  let user: string | undefined;
  if (poll.requireAuth) {
    user = await isAuthenticated();
    if (!user) {
      redirect("/login");
    }

    if (poll.singleVote && poll.voted?.includes(user)) {
      // Handle already voted
      return;
    }
  }

  const selectedOption = formData.get("option") as string;
  await submitVote(pollId, selectedOption, user);

  if (source === "public") {
    revalidatePath(`/p/${pollId}`);
    redirect(`/p/${pollId}?voted=true`);
  } else {
    revalidatePath(`/polls/${pollId}`);
  }
}

export async function updatePoll(pollId: string, prevState: any, formData: FormData) {
  const validatedFields = pollSchema.safeParse({
    question: formData.get("question"),
    options: formData.getAll("options").filter((o) => o !== ""),
    requiresAuthentication: formData.get("requiresAuthentication") === "on",
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const poll = await getPoll(pollId);

  if (!poll) {
    return { message: "Poll not found" };
  }

  poll.question = validatedFields.data.question;
  poll.options = validatedFields.data.options.map((option) => ({
    text: option,
    votes: 0,
  }));
  poll.requiresAuthentication = validatedFields.data.requiresAuthentication;

  // In a real app, you would have a proper updatePoll function
  const polls = await getPolls();
  const pollIndex = polls.findIndex((p) => p.id === pollId);
  if (pollIndex !== -1) {
    polls[pollIndex] = poll;
    await writePolls(polls);
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath(`/polls/${pollId}/settings`);
  redirect(`/polls/${pollId}`);
}

export async function deletePoll(pollId: string) {
  try {
    await removePoll(pollId);
    revalidatePath("/polls");
  } catch (error) {
    console.error("Error deleting poll:", error);
    // Optionally, you can return an error message to the client
    return { message: "Error deleting poll" };
  }
  redirect("/polls");
}

export async function togglePollStatus(pollId: string) {
  const poll = await getPoll(pollId);
  if (poll) {
    poll.status = poll.status === "open" ? "closed" : "open";
    // This is a simplified example. In a real app, you would have a proper updatePoll function
    const polls = await getPolls();
    const pollIndex = polls.findIndex((p) => p.id === pollId);
    if (pollIndex !== -1) {
      polls[pollIndex] = poll;
      await writePolls(polls);
    }
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");
  }
}

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // In a real app, you'd validate against a database
  if (username === "admin" && password === "password") {
    await setSession(username);
    redirect("/polls");
  } else {
    return { message: "Invalid username or password" };
  }
}

export async function logout() {
  await clearSession();
  redirect("/login");
}