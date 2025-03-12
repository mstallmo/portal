import { useState } from "react";
import { listDir } from "./portalClient";
import FileTree from "./components/FileTree";
import "./App.css";
import { DirTree } from "./data/dirTree";

function App() {
  const [tree, setTree] = useState<DirTree>({ roots: [] });

  async function getFiles() {
    const dirTree = await listDir(
      "/Users/mason/Workspace/portal/portal-server",
    );

    setTree(dirTree);
  }

  return (
    <div>
      <div className="flex fixed inset-y-0 z-50 w-72 flex-col">
        <FileTree tree={tree} />
      </div>
      <div className="pl-72">
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={getFiles}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get Files
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
