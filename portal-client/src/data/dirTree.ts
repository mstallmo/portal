export type DirTree = {
  roots: DirTreeItem[];
};

export type DirTreeItem = {
  path: string;
  children: DirTreeItem[];
};

export function isDir(item: DirTreeItem): boolean {
  return item.children.length > 0;
}
