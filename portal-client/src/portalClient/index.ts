import { invoke } from "@tauri-apps/api/core";
import { DirTree } from "../data/dirTree";
import { parseRaw } from "./protocol";

export async function listDir(path: string): Promise<DirTree> {
  const response: DirTree = await invoke("list_dir", { path });

  return response;
}

export type FileContent = {
  header: FileContentHeader;
  data: ArrayBuffer;
};

export type FileContentHeader = {
  mimeType: string;
};

export async function openFile(path: string): Promise<FileContent> {
  const response: ArrayBuffer = await invoke("open_file", { path });

  return parseRaw(response);
}
