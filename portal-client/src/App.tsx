import { useState, useEffect } from "react";
import { DirTree } from "./data/dirTree";
import { listDir } from "./portalClient";
import { isEmpty } from "./utils";
import "./App.css";
import DirectoryPicker from "./DirectoryPicker";
import ImageViewer from "./ImageViewer";
import Layout from "./Layout";
import { FileContent } from "./portalClient";

export default function App() {
  const [openDirectoryPicker, setOpenDirectoryPicker] = useState(false);
  const [rootDir, setRootDir] = useState<string>("");
  const [tree, setTree] = useState<DirTree>({ roots: [] });
  const [imageData, setImageData] = useState<FileContent | null>(null);

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
      setRootDir={setRootDir}
      setImageData={setImageData}
    >
      {isEmpty(rootDir) ? <></> : <ImageViewer content={imageData} />}
      <DirectoryPicker
        open={openDirectoryPicker}
        setOpen={setOpenDirectoryPicker}
        setRootDir={setRootDir}
      />
    </Layout>
  );
}
