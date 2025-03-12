import { useState } from "react";
import FileViewer from "./FileViewer";
import "./App.css";
import DirectoryPicker from "./DirectoryPicker";

export default function App() {
  const [rootDir, setRootDir] = useState<string>("");

  return (
    <main className="py-10">
      {rootDir.length > 0 ? (
        <FileViewer rootDir={rootDir} />
      ) : (
        <DirectoryPicker setRootDir={setRootDir} />
      )}
    </main>
  );
}
