import React, { useEffect } from "react";
import { Question, Option } from "../types";
import { cn } from "../utils";

interface ExportTemplateProps {
  question: Question;
  sectionName: string;
  subject: string;
}

export const ExportTemplate: React.FC<ExportTemplateProps> = ({
  question,
  sectionName,
  subject,
}) => {
  // Automatic Overlap Detection & Padding Adjustment
  useEffect(() => {
    const container = document.getElementById(`export-question-${question._id}`);
    if (!container) return;

    const adjustImages = () => {
      const images = container.querySelectorAll("img");
      images.forEach((img: HTMLImageElement) => {
        const checkImage = () => {
          // Standard styling from original script
          img.style.borderRadius = "4px";
          img.style.maxWidth = "100%";

          // If the image is a diagram (height > 45px or wide), protect it from overlap
          if (img.naturalHeight > 45 || img.naturalWidth > 120) {
            img.style.display = "block";
            img.style.clear = "both";
            img.style.margin = "40px auto"; // Increased padding for diagram clarity
          } else {
            // Original margin for small symbols/inline elements
            img.style.display = "inline-block";
            img.style.verticalAlign = "middle";
            img.style.margin = "8px 0";
          }
        };

        if (img.complete) {
          checkImage();
        } else {
          img.onload = checkImage;
        }
      });
    };

    adjustImages();
    const timer = setTimeout(adjustImages, 100);
    return () => clearTimeout(timer);
  }, [question._id]);

  const getOptionColor = (opt: Option, isPartiallyCorrect: boolean) => {
    if (opt.isCorrect) return "bg-[#059669]";
    if (opt.isMarked) {
      return isPartiallyCorrect ? "bg-[#d97706]" : "bg-[#dc2626]";
    }
    return "bg-[#6b7280]";
  };

  const isCorrect = question.isCorrect;
  const isAttempted = question.isAttempted;
  const isPartiallyCorrect = question.isPartiallyCorrect;

  return (
    <div
      id={`export-question-${question._id}`}
      className="bg-white p-[40px] w-[1000px] text-[#111827] font-sans flex flex-col"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100 flex-shrink-0">
        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider leading-none">
          Q{question.order} • {sectionName}
        </div>
        <div className={cn(
          "w-36 h-8 rounded-md text-[10px] font-bold text-white uppercase flex items-center justify-center text-center px-2 leading-none",
          isCorrect ? "bg-emerald-600" : isPartiallyCorrect ? "bg-yellow-600" : isAttempted ? "bg-rose-600" : "bg-gray-400"
        )}>
          {isCorrect ? "Correct" : isPartiallyCorrect ? "Partially Correct" : isAttempted ? "Incorrect" : "Not Attempted"}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex flex-col flex-1">
        {/* Comprehension Section */}
        {question.isComprehension && question.paragraph && (
          <div className="mb-8 p-6 bg-slate-50 border-l-4 border-blue-500 rounded-r-lg flex flex-col">
            <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4 leading-none">
              Comprehension
            </div>
            <div
              className="text-sm leading-relaxed prose prose-sm max-w-none text-[#111827] flex flex-col"
              dangerouslySetInnerHTML={{ __html: question.paragraph }}
            />
          </div>
        )}

        {/* Question Text */}
        <div
          className="text-lg leading-relaxed font-medium prose max-w-none text-[#111827] flex flex-col mb-8"
          dangerouslySetInnerHTML={{ __html: question.name }}
        />

        {/* Options */}
        <div className="flex flex-col gap-4 mb-6">
          {question.type === "multiple_choice" ? (
            question.options.map((opt, idx) => (
              <div
                key={opt._id}
                className={cn(
                  "relative border-2 rounded-lg p-4 flex gap-4 items-start",
                  opt.isCorrect ? "border-emerald-500/50 bg-emerald-50/50" : (opt.isMarked && !opt.isCorrect) ? "border-rose-500/50 bg-rose-50/50" : "border-gray-200 bg-gray-50"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full grid place-items-center text-xs font-bold text-white flex-shrink-0 leading-[0]",
                    getOptionColor(opt, isPartiallyCorrect || false)
                  )}
                >
                  <span className="block h-fit w-fit">{String.fromCharCode(65 + idx)}</span>
                </div>
                <div
                  className="flex-1 text-sm prose prose-sm max-w-none text-[#111827] flex flex-col"
                  dangerouslySetInnerHTML={{ __html: opt.name }}
                />
                {opt.isMarked && (
                  <div
                    className={cn(
                      "absolute -top-2.5 right-4 w-24 h-5 rounded text-[10px] font-bold text-white flex items-center justify-center text-center leading-none",
                      opt.isCorrect ? "bg-emerald-600" : isPartiallyCorrect ? "bg-yellow-600" : isAttempted ? "bg-rose-600" : "bg-gray-400"
                    )}
                  >
                    Your Answer
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="border border-gray-200 rounded-lg p-8 bg-gray-50 flex gap-8">
              <div className="flex-1 text-center border-r border-gray-200 flex flex-col items-center">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 leading-none">Correct Answer</div>
                <div className="text-xl font-mono font-bold text-emerald-600 leading-none">
                  {question.options[0]?.solution || question.options[0]?.nameText || "--"}
                </div>
              </div>
              <div className="flex-1 text-center flex flex-col items-center justify-center">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 leading-none">Your Answer</div>
                <div
                  className={cn(
                    "text-xl font-mono font-bold leading-none",
                    isCorrect ? "text-emerald-600" : isPartiallyCorrect ? "text-yellow-600" : isAttempted ? "text-rose-600" : "text-gray-400"
                  )}
                >
                  {question.fillUpsAnswers?.[0] || "Not attempted"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info (Marks/Time) */}
        <div className="mt-auto pt-6 border-t border-gray-100 flex gap-6 text-xs font-semibold text-gray-600 justify-center">
          <div className="leading-none flex items-center">Marks: <span className="text-emerald-600 ml-1">+{question.marks.positive}</span> / <span className="text-rose-600 ml-1">-{question.marks.negative}</span></div>
          <div className="border-l border-gray-300 pl-6 leading-none flex items-center">Time: {Math.floor(question.timeTaken / 1000)}s</div>
        </div>
      </div>
    </div>
  );
};
