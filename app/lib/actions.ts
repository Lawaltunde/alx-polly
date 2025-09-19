"use server";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// --- Profile Update Action ---
import { uploadProfilePicture } from "./supabase/storage";
const profileUpdateSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Must be a valid Gmail address").regex(/@gmail\.com$/, "Must be a Gmail address"),
  current_password: z.string().min(1, "Current password is required"),
  profile_picture: z.union([
    z.instanceof(File),
    z.undefined(),
  ]).optional(),
});

export async function updateProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { errors: { _form: ["Not authenticated or missing email."] } };
  }

  // Parse and validate form data
  const values = {
    first_name: formData.get("first_name")?.toString() || "",
    last_name: formData.get("last_name")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    current_password: formData.get("current_password")?.toString() || "",
    profile_picture: formData.get("profile_picture"),
  };
  const validated = profileUpdateSchema.safeParse(values);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }
  const { first_name, last_name, email, current_password, profile_picture } = validated.data;

  // Verify current password before allowing sensitive changes
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email as string,
    password: current_password,
  });
  if (signInError) {
    return { errors: { current_password: ["Current password is incorrect."] } };
  }

  // Update profile picture if provided
  let avatar_url = user.user_metadata?.avatar_url;
  if (profile_picture instanceof File) {
    try {
      avatar_url = await uploadProfilePicture(user.id, profile_picture);
    } catch (e: any) {
      return { errors: { profile_picture: [e.message] } };
    }
  }

  // Update user metadata/profile
  const { error: profileError } = await supabase.from("profiles").update({
    first_name,
    last_name,
    avatar_url,
  }).eq("id", user.id);
  if (profileError) {
    return { errors: { _form: [profileError.message] } };
  }

  // Update email if changed
  if (email && email !== user.email) {
    const { error: emailError } = await supabase.auth.updateUser({ email });
    if (emailError) {
      return { errors: { email: [emailError.message] } };
    }
  }

  // Success: redirect to dashboard
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting user in deleteAccountAction:", error);
      }
      redirect("/login");
    }
    user = data?.user;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Exception in getUser in deleteAccountAction:", err);
    }
    redirect("/login");
  }
  if (!user) {
    redirect("/login");
  }

  // Delete related data: votes, polls, etc. (add more as needed)
  // Delete votes
  const { error: votesError } = await supabase.from("votes").delete().eq("user_id", user.id);
  if (votesError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting votes:", votesError);
    }
    throw new Error("Failed to delete votes. Aborting account deletion.");
  }
  // Delete polls
  const { error: pollsError } = await supabase.from("polls").delete().eq("created_by", user.id);
  if (pollsError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting polls:", pollsError);
    }
    throw new Error("Failed to delete polls. Aborting account deletion.");
  }
  // Delete profile
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", user.id);
  if (profileError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting profile:", profileError);
    }
    throw new Error("Failed to delete profile. Aborting account deletion.");
  }

  // Sign out user only after successful cleanup
  await supabase.auth.signOut();
  redirect("/login");
}

import { 
  createPoll as createPollInSupabase, 
  getPoll, 
  deletePoll, 
  togglePollStatus as togglePollStatusInSupabase,
  updatePoll as updatePollInSupabase,
  getUserPolls 
} from "./supabase/queries";
import { submitVote as submitVoteToSupabase } from "./supabase/server-queries";
import { getCurrentUser, requireAuth } from "./auth";
import { generatePollQRCode } from "./qr-code";


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

  // Allow redirecting back to the originally requested page if provided
  const next = (formData.get('next') as string | null) || null;
  const safeNext = next && next.startsWith('/') ? next : null;
  revalidatePath("/", "layout");
  redirect(safeNext || "/polls");
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
  visibility: z.enum(["public","unlisted","private"]).optional(),
  results_visibility: z.enum(["public","after_close","owner_only"]).optional(),
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
      if (process.env.NODE_ENV === "development") {
        console.error("Error creating profile in createPoll:", profileError);
      }
      return {
        errors: { _form: ["Error creating your user profile."] },
        success: false,
      };
    }
  }

  // Normalize incoming form values with Zod and rely on validated values below
  const createSchema = z.object({
    question: z.string().min(1, "Question cannot be empty"),
    options: z.array(z.string().min(1)).min(2, "At least two options are required"),
    require_auth: z.preprocess(v => v === 'on' || v === true, z.boolean()).default(false),
    single_vote: z.preprocess(v => v === 'on' || v === true, z.boolean()).default(false),
    visibility: z.preprocess(v => (v === null ? undefined : v), z.enum(["public","unlisted","private"]).default('public')),
    results_visibility: z.preprocess(v => (v === null ? undefined : v), z.enum(["public","after_close","owner_only"]).default('public')),
  });

  console.log("formData options:", formData.getAll("options"));

  const validatedFields = createSchema.safeParse({
    question: formData.get("question"),
    options: formData.getAll("options").filter((o) => o !== ""),
    require_auth: formData.get("requireAuth"),
    single_vote: formData.get("singleVote"),
    visibility: formData.get("visibility"),
    results_visibility: formData.get("results_visibility"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { question, options, require_auth, single_vote, visibility, results_visibility } = validatedFields.data;

  // 1. Create poll
  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      question,
      created_by: user.id,
      require_auth,
      single_vote,
      visibility: visibility ?? 'public',
      results_visibility: results_visibility ?? 'public',
      status: "open",
    })
    .select()
    .single();

  if (pollError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Poll creation error:", pollError);
    }
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
    if (process.env.NODE_ENV === "development") {
      console.error("Poll options creation error:", optionsError);
    }
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
    // Don't blindly redirect to /polls; preserve context to return after login
    const user = await getCurrentUser();
    if (!user) {
      const nextPath = source === "public" ? `/p/${pollId}` : `/polls/${pollId}`;
      redirect(`/login?next=${encodeURIComponent(nextPath)}`);
    }
    userId = user!.id;
  }

  // Capture IP/User-Agent (best-effort)
  const { headers: getHeaders, cookies: getCookies } = await import("next/headers");
  const hdrs = await getHeaders();
  const cookieStore = await getCookies();
  const xff = hdrs.get('x-forwarded-for') || hdrs.get('x-real-ip') || '';
  const ip_address = xff.split(',')[0]?.trim() || null;
  const user_agent = hdrs.get('user-agent') || null;

  // Enforce single-vote for anonymous browsers using a cookie guard
  if (poll.single_vote && !userId) {
    const cookieKey = `voted_${pollId}`;
    const votedCookie = cookieStore.get(cookieKey);
    if (votedCookie?.value === '1') {
      // Already voted from this browser; just redirect to results
      if (source === "public") {
        revalidatePath(`/p/${pollId}`);
        redirect(`/p/${pollId}/results`);
      } else {
        revalidatePath(`/polls/${pollId}`);
        redirect(`/polls/${pollId}/results`);
      }
    }
  }

  try {
    if (poll.single_vote && userId) {
      // Double-check with server client so RLS sees auth.uid()
      const supabaseSrv = await (await import("./supabase/server")).createClient();
      const { data: existing } = await supabaseSrv
        .from('votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .maybeSingle();
      if (existing) {
        // Already voted; skip insert
      } else {
        await submitVoteToSupabase({
          poll_id: pollId,
          option_id: selectedOptionId,
          user_id: userId,
          ip_address: ip_address || undefined,
          user_agent: user_agent || undefined,
        });
      }
    } else {
      await submitVoteToSupabase({
        poll_id: pollId,
        option_id: selectedOptionId,
        user_id: userId,
        ip_address: ip_address || undefined,
        user_agent: user_agent || undefined,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error submitting vote:", error);
    }
    // Redirect even if vote fails to avoid user being stuck, but log the error.
  }

  // Set single-vote cookie for anonymous browsers after a successful vote
  if (poll.single_vote && !userId) {
    const { cookies: cookieApi } = await import("next/headers");
    const c = await cookieApi();
    c.set({ name: `voted_${pollId}`, value: '1', httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 365 });
  }

  if (source === "public") {
    revalidatePath(`/p/${pollId}`);
    redirect(`/p/${pollId}/results`);
  } else {
    revalidatePath(`/polls/${pollId}`);
    redirect(`/polls/${pollId}/results`);
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
  visibility: (formData.get("visibility") as string) || undefined,
  results_visibility: (formData.get("results_visibility") as string) || undefined,
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
    if (process.env.NODE_ENV === "development") {
      console.error('Error updating poll:', error);
    }
    return {
      errors: { general: ['Failed to update poll. Please try again.'] }
    };
  }
}

export async function deletePollAction(formData: FormData) {
  const pollId = formData.get("pollId") as string;
  const user = await requireAuth();
  try {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[deletePollAction] Attempting to delete poll: ${pollId} for user: ${user.id}`);
    }
    const supabase = await createClient();
    await (await import("@/app/lib/supabase/queries")).deletePoll(supabase, pollId, user.id);
    revalidatePath("/polls");
    redirect("/polls");
  } catch (error: any) {
    if (error && error.digest && String(error.digest).startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    // Log concise error and rethrow for framework feedback
    console.error("Poll deletion failed:", error);
    throw new Error("Failed to delete poll. Please try again.");
  }
}

export async function togglePollStatus(pollId: string) {
  try {
    const user = await requireAuth();
    await togglePollStatusInSupabase(pollId, user.id);
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/polls");
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error toggling poll status:', error);
    }
    // Redirect to polls page on error
    redirect("/polls");
  }
}

// Login and logout are now handled by Supabase Auth
// These functions are kept for backward compatibility but should be replaced
// with proper Supabase Auth integration in the UI components