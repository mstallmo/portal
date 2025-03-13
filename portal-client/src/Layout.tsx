import { useState, useEffect } from "react";
import { classNames, isEmpty } from "@/utils";
import { DirTree, DirTreeItem, isDir } from "@/data/dirTree";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/catalyst/dropdown";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/catalyst/sidebar";
import { SidebarLayout } from "@/components/catalyst/sidebar-layout";
import {
  ChevronDownIcon,
  Cog8ToothIcon,
  PlusIcon,
  FolderIcon as FolderIconSmall,
} from "@heroicons/react/16/solid";
import {
  SparklesIcon,
  DocumentIcon,
  FolderIcon,
  FolderOpenIcon,
} from "@heroicons/react/20/solid";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

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

type LayoutProps = {
  title: string;
  tree: DirTree;
  setOpenDirectoryPicker: (open: boolean) => void;
  children: React.ReactNode;
};

export default function Layout({
  tree,
  title,
  setOpenDirectoryPicker,
  children,
}: LayoutProps) {
  const [navTree, setNavTree] = useState(toNavTree(tree.roots));

  useEffect(() => {
    setNavTree(toNavTree(tree.roots));
  }, [tree]);

  return (
    <SidebarLayout
      navbar={null}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem} className="lg:mb-2.5">
                <SidebarLabel
                  className={classNames(
                    isEmpty(title) ? "text-gray-400" : "text-white",
                  )}
                >
                  {isEmpty(title) ? "Select a Directory..." : title}
                </SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu
                className="min-w-80 lg:min-w-64"
                anchor="bottom start"
              >
                <DropdownItem onClick={() => {}}>
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => setOpenDirectoryPicker(true)}>
                  <FolderIconSmall />
                  <DropdownLabel>History placeholder&hellip;</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={() => setOpenDirectoryPicker(true)}>
                  <PlusIcon />
                  <DropdownLabel>Open Directory&hellip;</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <ul role="list" className="space-y-1">
                {navTree.roots.map((item) => navItemNode(item))}
              </ul>
            </SidebarSection>
            <SidebarSpacer />
            <SidebarSection>
              <SidebarItem href="/changelog">
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}

function navItemNode(item: NavItem): JSX.Element {
  return (
    <li key={item.path}>
      {!isDir(item) ? (
        <button
          className={classNames(
            item.current ? "bg-gray-50" : "hover:bg-zinc-900",
            "block rounded-md py-2 pl-2 pr-2 text-sm/6 font-semibold text-white w-full",
          )}
        >
          <span className="flex justify-start gap-x-2">
            <DocumentIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-zinc-500 hover:text-white"
            />
            {item.path}
          </span>
        </button>
      ) : (
        <Disclosure as="div">
          <DisclosureButton
            className={classNames(
              item.current ? "bg-gray-50" : "hover:bg-zinc-900",
              "group flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm/6 font-semibold text-white",
            )}
          >
            <FolderIcon
              aria-hidden="true"
              className="size-5 shrink-0 text-zinc-500 group-data-open:hidden hover:text-white"
            />
            <FolderOpenIcon
              aria-hidden="true"
              className="hidden size-5 shrink-0 text-zinc-500 group-data-open:inline group-data-open:text-white"
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
