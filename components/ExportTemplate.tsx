import React, { useState, useEffect, useRef } from "react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2); // Starting with the 0.2 scale from trial.py
  const [finalHeightMm, setFinalHeightMm] = useState(0);

  // Exact logic from trial.py for scaling and fitting
  useEffect(() => {
    if (contentRef.current) {
      const actualHeightPx = contentRef.current.scrollHeight;
      const actualWidthPx = contentRef.current.scrollWidth;
      const aspectRatio = actualHeightPx / actualWidthPx;

      // 1. Base Scale (800px -> 160mm)
      let finalWidth = actualWidthPx * 0.2;
      let finalHeight = finalWidth * aspectRatio;

      const max_allowed_width = 175;
      const max_allowed_height = 130;

      // 2. Horizontal Constraint
      if (finalWidth > max_allowed_width) {
        finalWidth = max_allowed_width;
        finalHeight = finalWidth * aspectRatio;
      }

      // 3. Vertical Constraint (Handles "Big Questions")
      if (finalHeight > max_allowed_height) {
        finalHeight = max_allowed_height;
        finalWidth = finalHeight / aspectRatio;
      }

      // Calculate the final CSS scale factor needed to hit these physical mm dimensions
      // In web, 1mm is approx 3.78px
      const targetWidthPx = finalWidth * 3.78;
      const newScale = targetWidthPx / actualWidthPx;
      
      setScale(newScale);
      setFinalHeightMm(finalHeight);
    }
  }, [question._id]);

  const isCorrect = question.isCorrect;
  const isAttempted = question.isAttempted;
  const isPartiallyCorrect = question.isPartiallyCorrect;

  const getStatusColor = () => {
    if (isCorrect) return "059669";
    if (isPartiallyCorrect) return "d97706";
    if (isAttempted) return "dc2626";
    return "d97706";
  };

  return (
    <div className="bg-white w-[210mm] h-[297mm] relative font-sans overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      
      {/* HEADER (y=3, line at y=10) */}
      <div className="absolute top-[3mm] left-[12mm] text-[10pt] font-normal text-black no-print-border">
        {subject}
      </div>
      <div className="absolute top-[10mm] left-[10mm] right-[10mm] h-[0.2mm] bg-black"></div>

      {/* 
        MAIN CONTENT BLOCK (trial.py logic: x=25, y=14)
        Everything inside here is scaled proportionally to fit the 175x130 box
      */}
      <div className="absolute left-[25mm] top-[14mm] w-[175mm] h-[130mm] flex items-start justify-start">
        <div 
          ref={contentRef}
          className="w-[800px] origin-top-left h-fit"
          style={{ transform: `scale(${scale})` }}
        >
          {/* Internal Layout from extraction script */}
          <div style={{ marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
              {sectionName} • Q{question.order}
            </div>
            <div style={{ background: `#${getStatusColor()}`, color: "white", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>
              {isCorrect ? "Correct" : isPartiallyCorrect ? "Partially Correct" : isAttempted ? "Incorrect" : "Not Attempted"}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            {question.isComprehension && question.paragraph && (
              <div style={{ marginBottom: "20px", padding: "16px", background: "#f8fafc", borderLeft: "4px solid #3b82f6", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#3b82f6", marginBottom: "8px", textTransform: "uppercase" }}>Comprehension</div>
                <div style={{ lineHeight: "1.6" }} className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-[4px] [&_img]:my-[8px] text-[16px]" dangerouslySetInnerHTML={{ __html: question.paragraph }} />
              </div>
            )}
            <div style={{ fontSize: "18px", marginBottom: "24px", lineHeight: "1.7", color: "#111827" }} className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-[4px] [&_img]:my-[8px]" dangerouslySetInnerHTML={{ __html: question.name }} />
          </div>

          <div style={{ fontSize: "14px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", marginBottom: "16px" }}>Options</div>
          <div style={{ marginBottom: "24px" }}>
            {question.type === "multiple_choice" ? (
              question.options.map((opt, i) => (
                <div key={opt._id} style={{ border: `2px solid ${opt.isCorrect ? "rgba(5, 150, 105, 0.5)" : (opt.isMarked ? "rgba(220, 38, 38, 0.5)" : "#d1d5db")}`, borderRadius: "8px", padding: "16px", marginBottom: "12px", display: "flex", gap: "12px", position: "relative", background: opt.isCorrect ? "rgba(5, 150, 105, 0.05)" : (opt.isMarked ? "rgba(220, 38, 38, 0.05)" : "#f9fafb") }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", background: opt.isCorrect ? "#059669" : (opt.isMarked ? "#dc2626" : "#6b7280"), color: "white" }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div style={{ flex: 1 }} className="text-[16px] [&_img]:max-w-full" dangerouslySetInnerHTML={{ __html: opt.name }} />
                </div>
              ))
            ) : (
              <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "24px", background: "#f9fafb", display: "flex", gap: "24px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>CORRECT ANSWER</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: "#059669" }}>{question.options[0]?.solution || "--"}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: "bold" }}>YOUR ANSWER</div>
                  <div style={{ fontSize: "20px", fontWeight: "bold", color: isCorrect ? "#059669" : "#dc2626" }}>{question.fillUpsAnswers?.[0] || "Not attempted"}</div>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "12px", background: "#f3f4f6", borderRadius: "8px", fontSize: "14px", display: "flex", gap: "16px" }}>
            <span>Marks: <span style={{ color: "#059669", fontWeight: 600 }}>+{question.marks.positive}</span> / <span style={{ color: "#dc2626", fontWeight: 600 }}>-{question.marks.negative}</span></span>
          </div>
        </div>
      </div>

      {/* --- TABS SECTION (trial.py logic: y_image_bottom + 5) --- */}
      <div 
        className="absolute left-0 right-0 transition-all duration-200"
        style={{ top: `${14 + finalHeightMm + 5}mm` }}
      >
        <div className="flex justify-center gap-[4mm] mb-[4mm]">
          {["Silly", "Easy", "Time", "Concept", "Key", "Others"].map((tab) => (
            <div key={tab} className="w-[18mm] h-[6mm] border-[0.3mm] border-[#5050B4] bg-[#F5F5FF] rounded flex items-center justify-center">
              <span className="text-[7pt] font-medium text-[#282878]">{tab}</span>
            </div>
          ))}
        </div>
        
        <div className="px-[10mm] space-y-[2mm]">
          <div className="h-[0.1mm] bg-black w-full opacity-30"></div>
          <div className="h-[0.1mm] bg-black w-full opacity-30"></div>
        </div>
      </div>

    </div>
  );
};
