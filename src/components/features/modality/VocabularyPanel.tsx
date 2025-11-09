import React from "react";

interface Props {
  event: unknown;
  isWaiting: boolean;
}

const VocabularyPanel: React.FC<Props> = ({ event, isWaiting }) => {
  if (isWaiting || !event) {
    return (
      <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-gray-500">
        Waiting for vocabulary challenges…
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto px-6 py-5">
      <pre className="whitespace-pre-wrap break-words text-xs leading-relaxed text-gray-700">
        {typeof event === "string" ? event : JSON.stringify(event, null, 2)}
      </pre>
    </div>
  );
};

export default VocabularyPanel;
