import { invoke } from "@tauri-apps/api/core";
import { DirTree } from "../data/dirTree";

export async function listDir(path: string): Promise<DirTree> {
  const response: DirTree = await invoke("list_dir", { path });

  return response;
}
