import { createClient } from "./client";

export async function uploadProfilePicture(userId: string, file: File) {
  // Validate userId
  if (typeof userId !== "string" || !userId.trim()) {
    throw new Error("Invalid userId: must be a non-empty string.");
  }
  // Optionally enforce a stricter pattern (e.g., UUID or custom regex)
  // if (!/^[a-zA-Z0-9_-]{3,64}$/.test(userId)) {
  //   throw new Error("Invalid userId format.");
  // }

  // Validate file
  if (!file || typeof file !== "object" || typeof file.name !== "string" || typeof file.type !== "string") {
    throw new Error("Invalid file: must be a File object with a name and type.");
  }
  // Allowed image mime types
  const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type: only PNG, JPEG, and WEBP images are allowed.");
  }
  // Max size: 1MB
  const maxSize = 1024 * 1024;
  if ((file as any).size && (file as any).size > maxSize) {
    throw new Error("File too large: maximum allowed size is 1MB.");
  }

  const supabase = await createClient();

  // Sanitize userId: allow only alphanumeric, hyphen, underscore; trim, cap length, fallback if empty
  let sanitizedId = (userId || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64).trim();
  if (!sanitizedId) sanitizedId = "user" + Math.random().toString(36).slice(2, 10);

  // Validate/normalize fileExt: allow only safe extensions
  let fileExt = file.name.split('.').pop()?.toLowerCase() || "bin";
  if (!/^[a-z0-9]{1,8}$/.test(fileExt)) fileExt = "bin";

  // Sanitize filename (prevent path traversal)
  let safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 64);

  const filePath = `avatars/${sanitizedId}.${fileExt}`;
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
