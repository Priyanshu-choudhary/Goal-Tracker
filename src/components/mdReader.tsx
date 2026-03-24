import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function MdReader() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/DSA-Goal.md")
      .then((res) => res.text())
      .then((text) => setContent(text));
  }, []);

  return (
    <div>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default MdReader;