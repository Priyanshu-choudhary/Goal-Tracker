import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-white border-b border-slate-700 pb-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-purple-400" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold mt-4 mb-2 text-purple-300" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-slate-300 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 mb-4 space-y-1 text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 mb-4 space-y-1 text-slate-300" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="pl-1" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-purple-500 bg-slate-800/50 pl-4 py-2 my-4 italic text-slate-400 rounded-r-lg" {...props} />
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                <div className="bg-slate-800 px-4 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-700 flex justify-between items-center">
                  <span>{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    fontSize: "0.85rem",
                    backgroundColor: "transparent",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-slate-700/50 text-purple-300 px-1.5 py-0.5 rounded font-mono text-sm border border-slate-600"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-slate-700 shadow-lg">
              <table className="w-full text-sm text-left border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-800/80 text-slate-200 font-bold border-b border-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-4 py-3 border-r border-slate-700 last:border-0" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2.5 border-t border-r border-slate-700 last:border-0 text-slate-300 bg-slate-800/30" {...props} />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-slate-700" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a className="text-purple-400 hover:text-purple-300 underline decoration-purple-500/30 underline-offset-4 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          input: ({ node, ...props }) => {
            if (props.type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900 transition-all mr-2"
                  readOnly
                  checked={props.checked}
                />
              );
            }
            return <input {...props} />;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
