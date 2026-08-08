import api from "./axios";
import type { ApiResponse } from "@/types/api";
import { getStoredAccessToken } from "@/services/auth.service";
import { env } from "@/config/env";

export type HubMediaFolder =
  | "hub-receipts/photos"
  | "hub-receipts/documents"
  | "receiving/photos"
  | "receiving/documents";

export interface HubMediaUploadResult {
  key: string;
  storageKey: string;
  url: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  folder: string;
}

function parseUploadResponse(
  json: ApiResponse<HubMediaUploadResult> & {
    url?: string;
    storageKey?: string;
    size?: number;
    mimeType?: string;
  },
): HubMediaUploadResult {
  const data = json.data;
  const url = data?.publicUrl || data?.url || json.url || "";
  const storageKey = data?.storageKey || data?.key || json.storageKey || "";
  if (!url) {
    throw new Error(json.message || "Upload response missing url");
  }
  return {
    key: data?.key || storageKey,
    storageKey,
    url,
    publicUrl: url,
    mimeType: data?.mimeType || json.mimeType || "",
    size: data?.size ?? json.size ?? 0,
    folder: data?.folder || "",
  };
}

export async function uploadHubMediaFile(
  file: File,
  folder: HubMediaFolder,
): Promise<HubMediaUploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const token = getStoredAccessToken();
  const baseURL = api.defaults.baseURL || env.apiBaseUrl;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseURL}/hub/media/upload?folder=${encodeURIComponent(folder)}`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.onload = () => {
      try {
        const json = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(parseUploadResponse(json));
        } else {
          reject(new Error(json.message || "Upload failed"));
        }
      } catch (error) {
        reject(error instanceof Error ? error : new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export const mediaService = {
  uploadPhoto: (file: File) =>
    uploadHubMediaFile(file, "hub-receipts/photos"),
  uploadDocument: (file: File) =>
    uploadHubMediaFile(file, "hub-receipts/documents"),
};
