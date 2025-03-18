import { classNames, isEmpty } from "@/utils";
import { isDir, NavTree, NavItem } from "@/data/dirTree";
import { openFile, FileContent } from "@/portalClient";
import { useDirectoryHistory } from "@/hooks/directory";
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

type LayoutProps = {
  currentDirectory: string;
  navTree: NavTree;
  setOpenDirectoryPicker: (open: boolean) => void;
  setCurrentDirectory: (dir: string) => void;
  setImageData: (data: FileContent | null) => void;
  children: React.ReactNode;
};

export default function Layout({
  currentDirectory,
  navTree,
  setOpenDirectoryPicker,
  setCurrentDirectory,
  setImageData,
  children,
}: LayoutProps) {
  const { dirHistoryItems } = useDirectoryHistory(currentDirectory);

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
                    isEmpty(currentDirectory) ? "text-gray-400" : "text-white",
                  )}
                >
                  {isEmpty(currentDirectory)
                    ? "Select a Directory..."
                    : currentDirectory}
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
                {historyItems(dirHistoryItems, setCurrentDirectory)}
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
                {navTree.roots.map((item) =>
                  navItemNode(item, setImageData, currentDirectory),
                )}
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

function historyItems(
  dirHistoryItems: string[],
  setCurrentDirectory: (dir: string) => void,
): JSX.Element[] {
  return dirHistoryItems.map((item, idx) => {
    return (
      <DropdownItem
        key={`history-${idx}`}
        onClick={() => setCurrentDirectory(item)}
      >
        <FolderIconSmall />
        <DropdownLabel>{item}</DropdownLabel>
      </DropdownItem>
    );
  });
}

function navItemNode(
  item: NavItem,
  setImageData: (data: FileContent | null) => void,
  parentPath?: string,
): JSX.Element {
  async function handleFileClick(path: string) {
    const fileContent = await openFile(path);

    setImageData(fileContent);
  }

  return (
    <li key={item.path}>
      {!isDir(item) ? (
        <button
          className={classNames(
            item.current ? "bg-gray-50" : "hover:bg-zinc-900",
            "block rounded-md py-2 pl-2 pr-2 text-sm/6 font-semibold text-white w-full",
          )}
          onClick={() => {
            const path = parentPath ? `${parentPath}/${item.path}` : item.path;
            handleFileClick(path);
          }}
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
            {item.children.map((subItem) => {
              const path = parentPath
                ? `${parentPath}/${item.path}`
                : item.path;
              return navItemNode(subItem as NavItem, setImageData, path);
            })}
          </DisclosurePanel>
        </Disclosure>
      )}
    </li>
  );
}
