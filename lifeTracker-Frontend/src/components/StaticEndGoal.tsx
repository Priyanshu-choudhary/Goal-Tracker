import React from "react";

interface Props {
  /** If provided, this HTML string will be rendered. Otherwise the built-in example HTML is used. */
  contentHtml?: string;
  className?: string;
}

export default function StaticEndGoal({ contentHtml, className }: Props) {
  const DEFAULT_HTML = `
  <div>
    <h3 style="margin:0 0 8px 0; font-size:1rem;">DSA Plan Re-evaluation</h3>
    <pre style="white-space:pre-wrap; font-family:inherit; font-size:0.85rem; margin:0;">
PhasePeriodDaysLC/dayLC AddedCumulative LCChallenge finishNow → Apr 30~19~2.8~53~160GFG completionMay 1 → May 27~273~81~241Pure LC grindMay 28 → Jul 31~644.0~259~500 ✓
    </pre>
  </div>
  `;

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-lg ${className || ""}`}>
      <div dangerouslySetInnerHTML={{ __html: contentHtml || DEFAULT_HTML }} />
    </div>
  );
}
