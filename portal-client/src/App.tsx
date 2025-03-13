import { useState, useEffect } from "react";
import { DirTree } from "./data/dirTree";
import { listDir } from "./portalClient";
import { isEmpty } from "./utils";
import "./App.css";
import DirectoryPicker from "./DirectoryPicker";
import ImageViewer from "./ImageViewer";
import Layout from "./Layout";

export default function App() {
  const [openDirectoryPicker, setOpenDirectoryPicker] = useState(false);
  const [rootDir, setRootDir] = useState<string>("");
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
    <Layout
      tree={tree}
      title={rootDir}
      setOpenDirectoryPicker={setOpenDirectoryPicker}
    >
      {isEmpty(rootDir) ? <></> : <ImageViewer />}
      <DirectoryPicker
        open={openDirectoryPicker}
        setOpen={setOpenDirectoryPicker}
        setRootDir={setRootDir}
      />
    </Layout>
  );
}
