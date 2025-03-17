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

export interface NavTree extends DirTree {
  roots: NavItem[];
}

export interface NavItem extends DirTreeItem {
  current: boolean;
}

export function toNavTree(roots: DirTreeItem[]): NavTree {
  const navRoots: NavItem[] = [];

  for (const item of roots) {
    if (isDir(item)) {
      navRoots.push({
        ...item,
        children: toNavTree(item.children).roots,
        current: false,
      });
    } else {
      navRoots.push({ ...item, current: false });
    }
  }

  return { roots: navRoots };
}
