import { createClient } from "./client";

export async function uploadProfilePicture(userId: string, file: File) {
  const supabase = await createClient();
  const fileExt = file.name.split('.').pop();
  const filePath = `avatars/${userId}.${fileExt}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type,
    });
  if (error) {
    throw new Error(error.message);
  }
  // Return the public URL
  const { publicUrl } = supabase.storage.from("avatars").getPublicUrl(filePath).data;
  return publicUrl;
}
