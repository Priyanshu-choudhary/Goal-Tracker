import { useEffect, useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

function MdReader() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/DSA-Goal.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
      <MarkdownRenderer content={content} />
    </div>
  );
}

export default MdReader;