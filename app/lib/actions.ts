"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { 
  createPoll as createPollInSupabase, 
  getPoll, 
  deletePoll, 
  submitVote as submitVoteToSupabase,
  togglePollStatus as togglePollStatusInSupabase,
  updatePoll as updatePollInSupabase,
  getUserPolls 
} from "./supabase/queries";
import { getCurrentUser, requireAuth } from "./auth";
import { generatePollQRCode } from "./qr-code";
import { createClient } from "./supabase/server";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    return {
      errors: { general: [error.message] },
    };
  }

  revalidatePath("/", "layout");
  redirect("/polls");
}

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(validatedFields.data);

  if (error) {
    return {
      errors: { general: [error.message] },
    };
  }

  revalidatePath("/", "layout");
  redirect("/polls");
}

const pollSchema = z.object({
  question: z.string().min(1, "Question is required"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(2, "At least two options are required"),
  require_auth: z.boolean(),
  single_vote: z.boolean(),
});

export async function createPoll(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ensure the user has a profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: user.id });

    if (profileError) {
      console.error("Error creating profile in createPoll:", profileError);
      return {
        errors: { _form: ["Error creating your user profile."] },
        success: false,
      };
    }
  }

  const schema = z.object({
    question: z.string().min(1, "Question cannot be empty"),
    options: z
      .array(z.string().min(1))
      .min(2, "At least two options are required"),
  });

  console.log("formData options:", formData.getAll("options"));

  const validatedFields = schema.safeParse({
    question: formData.get("question"),
    options: formData.getAll("options").filter((o) => o !== ""),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { question, options } = validatedFields.data;
  const requireAuth = formData.get("requireAuth") === "on";
  const singleVote = formData.get("singleVote") === "on";

  // 1. Create poll
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      question,
      created_by: user.id,
      require_auth: requireAuth,
      single_vote: singleVote,
      status: "open",
    })
    .select()
    .single();

  if (pollError) {
    console.error("Poll creation error:", pollError);
    return {
      errors: { _form: [pollError.message] },
      success: false,
    };
  }

  // 2. Create poll options
  const pollOptions = options.map((text, index) => ({
    text,
    poll_id: poll.id,
    order_index: index,
  }));

  console.log("pollOptions to be inserted:", pollOptions);

  const { error: optionsError } = await supabase
    .from("poll_options")
    .insert(pollOptions);

  if (optionsError) {
    console.error("Poll options creation error:", optionsError);
    // This is not transactional. If this fails, the poll is created without options.
    // For now, this is better than what was there before.
    return {
      errors: { _form: [optionsError.message] },
      success: false,
    };
  }

  revalidatePath("/polls");
  return { success: true, errors: {}, poll };
}

export async function handleVote(
  pollId: string,
  source: "dashboard" | "public",
  formData: FormData
) {
  try {
    const poll = await getPoll(pollId);
    if (!poll || poll.status === "closed") {
      // Handle poll not found or closed
      return;
    }

    let userId: string | undefined;
    if (poll.require_auth) {
      const user = await requireAuth();
      userId = user.id;
    }

    const selectedOptionId = formData.get("option") as string;
    
    // Submit vote using the new Supabase function
    await submitVoteToSupabase({
      poll_id: pollId,
      option_id: selectedOptionId,
      user_id: userId
    });

    if (source === "public") {
      revalidatePath(`/p/${pollId}`);
      redirect(`/p/${pollId}?voted=true`);
    } else {
      revalidatePath(`/polls/${pollId}`);
    }
  } catch (error) {
    console.error('Error handling vote:', error);
    // You might want to return an error message here
  }
}

export async function updatePoll(pollId: string, prevState: any, formData: FormData) {
  try {
    const user = await requireAuth();
    
    const validatedFields = pollSchema.safeParse({
      question: formData.get("question"),
      options: formData.getAll("options").filter((o) => o !== ""),
      require_auth: formData.get("requireAuth") === "on",
      single_vote: formData.get("singleVote") === "on",
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Use the Supabase update function
    await updatePollInSupabase(pollId, validatedFields.data, user.id);

    revalidatePath(`/polls/${pollId}`);
    revalidatePath(`/polls/${pollId}/settings`);
    redirect(`/polls/${pollId}`);
  } catch (error) {
    console.error('Error updating poll:', error);
    return {
      errors: { general: ['Failed to update poll. Please try again.'] }
    };
  }
}

export async function deletePollAction(pollId: string) {
  try {
    const user = await requireAuth();
    await deletePoll(pollId, user.id);
    revalidatePath("/polls");
    redirect("/polls");
  } catch (error) {
    console.error("Error deleting poll:", error);
    // Redirect to polls page on error
    redirect("/polls");
  }
}

export async function togglePollStatus(pollId: string) {
  try {
    const user = await requireAuth();
    await togglePollStatusInSupabase(pollId, user.id);
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");
  } catch (error) {
    console.error('Error toggling poll status:', error);
    // Redirect to polls page on error
    redirect("/polls");
  }
}

// Login and logout are now handled by Supabase Auth
// These functions are kept for backward compatibility but should be replaced
// with proper Supabase Auth integration in the UI components