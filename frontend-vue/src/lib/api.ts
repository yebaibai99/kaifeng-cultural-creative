import { useAuthStore } from "../stores/auth";

export type ApiError = { error: string };

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = useAuthStore();
  const headers = new Headers(init?.headers || {});
  headers.set("Content-Type", "application/json");
  if (auth.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const res = await fetch(path, { ...init, headers });
  const data = await readJsonSafe(res);
  if (!res.ok) {
    const err = (data && typeof data === "object" && "error" in data) ? (data as ApiError).error : "HTTP_ERROR";
    throw new Error(err);
  }
  return data as T;
}

/** 管理员上传封面图（multipart），返回可写入商品的相对 URL，如 /uploads/covers/xxx.jpg */
export async function apiUploadAdminCover(file: File): Promise<{ url: string }> {
  const auth = useAuthStore();
  const formData = new FormData();
  formData.append("file", file);
  const headers = new Headers();
  if (auth.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const res = await fetch("/api/admin/uploads/cover", { method: "POST", body: formData, headers });
  const data = await readJsonSafe(res);
  if (!res.ok) {
    const err = (data && typeof data === "object" && data !== null && "error" in data) ? (data as ApiError).error : "HTTP_ERROR";
    throw new Error(err);
  }
  return data as { url: string };
}

// ... existing code ...

/** 创作者上传封面图（multipart），返回可写入商品的相对 URL，如 /uploads/covers/xxx.jpg */
export async function apiUploadCreatorCover(file: File): Promise<{ url: string }> {
  const auth = useAuthStore();
  const formData = new FormData();
  formData.append("file", file);
  const headers = new Headers();
  if (auth.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const res = await fetch("/api/creator/uploads/cover", { method: "POST", body: formData, headers });
  const data = await readJsonSafe(res);
  if (!res.ok) {
    const err = (data && typeof data === "object" && data !== null && "error" in data) ? (data as ApiError).error : "HTTP_ERROR";
    throw new Error(err);
  }
  return data as { url: string };
}

