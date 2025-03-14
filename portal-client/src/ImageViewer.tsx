import { useMemo } from "react";
import { FileContent } from "./portalClient";

type ImageDataProps = {
  content: FileContent | null;
};

export default function ImageViewer({ content }: ImageDataProps) {
  const image = useMemo(() => {
    if (content) {
      console.log(content);
      const blob = new Blob([content.data], { type: content.header.mimeType });
      return URL.createObjectURL(blob);
    }
  }, [content]);

  return <div>{image && <img src={image} alt="Image" />}</div>;
}
