import { useState, useEffect } from "react";
import { DirTree } from "./data/dirTree";
import { listDir } from "./portalClient";
import FileTree from "./components/FileTree";

type FileViewerProps = {
  rootDir: string;
};

export default function FileViewer({ rootDir }: FileViewerProps) {
  const [tree, setTree] = useState<DirTree>({ roots: [] });

  useEffect(() => {
    const fetchDirTree = async () => {
      if (rootDir.length > 0) {
        const dirTree = await listDir(rootDir);

        setTree(dirTree);
      }
    };

    fetchDirTree();
  }, [rootDir]);

  return (
    <div>
      <div className="flex fixed inset-y-0 z-50 w-72 flex-col">
        <FileTree tree={tree} />
      </div>
      <div className="pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* TODO: Implement file viewer */}
          </div>
        </main>
      </div>
    </div>
  );
}
