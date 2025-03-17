import { useEffect, useState } from "react";
import { isEmpty } from "@/utils";
import "@/App.css";
import DirectoryPicker from "@/DirectoryPicker";
import ImageViewer from "@/ImageViewer";
import Layout from "@/Layout";
import { FileContent } from "@/portalClient";
import { useDirectory } from "@/hooks/directory";

export default function App() {
  const [openDirectoryPicker, setOpenDirectoryPicker] = useState(false);
  const [imageData, setImageData] = useState<FileContent | null>(null);
  const { currentDirectory, setCurrentDirectory, navTree } = useDirectory();

  // Clear image data when current directory changes
  useEffect(() => {
    setImageData(null);
  }, [currentDirectory]);

  return (
    <Layout
      currentDirectory={currentDirectory}
      navTree={navTree}
      setCurrentDirectory={setCurrentDirectory}
      setOpenDirectoryPicker={setOpenDirectoryPicker}
      setImageData={setImageData}
    >
      {isEmpty(currentDirectory) ? <></> : <ImageViewer content={imageData} />}
      <DirectoryPicker
        open={openDirectoryPicker}
        setOpen={setOpenDirectoryPicker}
        setCurrentDirectory={setCurrentDirectory}
      />
    </Layout>
  );
}
