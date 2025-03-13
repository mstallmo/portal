import { useEffect, useState } from "react";
import { DirTree, DirTreeItem, isDir } from "@/data/dirTree";
import { classNames } from "@/utils";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import {
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/24/outline";

interface NavTree extends DirTree {
  roots: NavItem[];
}

interface NavItem extends DirTreeItem {
  current: boolean;
}

function toNavTree(roots: DirTreeItem[]): NavTree {
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

interface FileTreeProps {
  tree: DirTree;
}

export default function FileTree({ tree }: FileTreeProps) {
  const [navTree, setNavTree] = useState(toNavTree(tree.roots));

  useEffect(() => {
    setNavTree(toNavTree(tree.roots));
  }, [tree]);

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div className="flex h-16 shrink-0 items-center">
        <img
          alt="Your Company"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          className="h-8 w-auto"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navTree.roots.map((item) => navItemNode(item))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function navItemNode(item: NavItem): JSX.Element {
  return (
    <li key={item.path}>
      {!isDir(item) ? (
        <button
          className={classNames(
            item.current ? "bg-gray-50" : "hover:bg-gray-50",
            "block rounded-md py-2 pl-2 pr-2 text-sm/6 font-semibold text-gray-700 w-full",
          )}
        >
          <span className="flex justify-start gap-x-2">
            <DocumentIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400"
            />
            {item.path}
          </span>
        </button>
      ) : (
        <Disclosure as="div">
          <DisclosureButton
            className={classNames(
              item.current ? "bg-gray-50" : "hover:bg-gray-50",
              "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-gray-700",
            )}
          >
            <FolderIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-gray-400 group-data-open:hidden"
            />
            <FolderOpenIcon
              aria-hidden="true"
              className="hidden size-5 shrink-0 text-gray-500 group-data-open:inline"
            />
            {item.path}
          </DisclosureButton>
          <DisclosurePanel as="ul" className="mt-1 px-2">
            {item.children.map((subItem) => navItemNode(subItem as NavItem))}
          </DisclosurePanel>
        </Disclosure>
      )}
    </li>
  );
}
