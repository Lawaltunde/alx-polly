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

export async function handleVote(formData: FormData) {
  const pollId = formData.get("pollId") as string;
  const selectedOptionId = formData.get("selectedOptionId") as string;
  const source = formData.get("source") as "public" | "dashboard";

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

  try {
    await submitVoteToSupabase({
      poll_id: pollId,
      option_id: selectedOptionId,
      user_id: userId,
    });
  } catch (error) {
    console.error("Error submitting vote:", error);
    // Redirect even if vote fails to avoid user being stuck, but log the error.
  }

  if (source === "public") {
    revalidatePath(`/p/${pollId}`);
    redirect(`/p/${pollId}?voted=true`);
  } else {
    revalidatePath(`/polls/${pollId}`);
    redirect(`/polls/${pollId}`);
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

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  profile_picture: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size === 0 || file.size <= 5 * 1024 * 1024,
      `File size must be less than 5MB.`
    )
    .refine(
      (file) =>
        !file ||
        file.size === 0 ||
        ["image/jpeg", "image/png", "image/gif"].includes(file.type),
      `Only .jpg, .png, and .gif formats are supported.`
    ),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const validatedFields = profileSchema.safeParse({
    username: formData.get("username"),
    profile_picture: formData.get("profile_picture"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "",
    };
  }

  const { username, profile_picture } = validatedFields.data;
  const userMetadata: { user_name: string; avatar_url?: string } = {
    user_name: username,
  };

  if (profile_picture && profile_picture.size > 0) {
    const fileExt = profile_picture.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, profile_picture, { upsert: true });

    if (uploadError) {
      return {
        errors: { profile_picture: [uploadError.message] },
        message: "",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

        userMetadata.avatar_url = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`
  }

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, ...userMetadata },
  });

  if (error) {
    return {
      errors: { _form: [error.message] },
      message: "",
    };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { errors: {}, message: "Profile updated successfully!" };
}


// Login and logout are now handled by Supabase Auth
// These functions are kept for backward compatibility but should be replaced
// with proper Supabase Auth integration in the UI components