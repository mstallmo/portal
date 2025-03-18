import { useState, useEffect } from "react";
import { DirTree, toNavTree } from "@/data/dirTree";
import { addDirToHistory, getHistory } from "@/data/dirHistory";
import { listDir } from "@/portalClient";

export function useDirectory() {
  const [currentDirectory, setCurrentDirectory] = useState<string>("");
  const [tree, setTree] = useState<DirTree>({ roots: [] });
  const [navTree, setNavTree] = useState(toNavTree(tree.roots));

  useEffect(() => {
    const fetchDirTree = async () => {
      if (currentDirectory.length > 0) {
        const dirTree = await listDir(currentDirectory);

        setTree(dirTree);
      }
    };

    fetchDirTree();
  }, [currentDirectory]);

  useEffect(() => {
    setNavTree(toNavTree(tree.roots));
  }, [tree]);

  return { currentDirectory, setCurrentDirectory, navTree };
}

export function useDirectoryHistory(currentDirectory: string) {
  const [dirHistoryItems, setDirHistoryItems] = useState<string[]>([]);

  useEffect(() => {
    const updateHistory = async () => {
      if (
        currentDirectory.length > 0 &&
        !dirHistoryItems.includes(currentDirectory)
      ) {
        await addDirToHistory(currentDirectory);
        setDirHistoryItems([...dirHistoryItems, currentDirectory]);
      }
    };

    updateHistory();
  }, [currentDirectory]);

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getHistory();
      setDirHistoryItems(history);
    };

    fetchHistory();
  }, []);

  return { dirHistoryItems };
}
