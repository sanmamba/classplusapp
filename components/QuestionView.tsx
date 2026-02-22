import React, { useState, useEffect, useRef } from "react";
import { Question, Option, SectionStats } from "../types";
import { cn, formatTime } from "../utils";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Dialog } from "./ui/Dialog";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bookmark,
  Star,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Save,
  Copy,
  Check,
  Loader2,
} from "lucide-react";

interface QuestionViewProps {
  question: Question;
  sectionName: string;
  isStarred: boolean;
  onToggleStar: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  sectionStats: SectionStats | null;
  onUpdateData: (question: Question, sectionStats: SectionStats | null) => void;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  sectionName,
  isStarred,
  onToggleStar,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  sectionStats,
  onUpdateData,
}) => {
  // Determine user's selected option (if any)
  const userSelectedOption = question.options.find((opt) => opt.isMarked);
  const questionContentRef = useRef<HTMLDivElement>(null);

  // Dialog State
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [jsonQuestion, setJsonQuestion] = useState("");
  const [jsonStats, setJsonStats] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Copy State
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Load JSON when dialog opens
  useEffect(() => {
    if (isUpdateOpen) {
      setJsonQuestion(JSON.stringify(question, null, 2));
      setJsonStats(sectionStats ? JSON.stringify(sectionStats, null, 2) : "");
      setJsonError(null);
    }
  }, [isUpdateOpen, question, sectionStats]);

  const handleSaveJson = () => {
    try {
      const parsedQuestion = JSON.parse(jsonQuestion);
      const parsedStats = jsonStats.trim() ? JSON.parse(jsonStats) : null;

      // Basic validation
      if (!parsedQuestion._id || !parsedQuestion.type) {
        throw new Error("Invalid Question JSON structure");
      }

      onUpdateData(parsedQuestion, parsedStats);
      setIsUpdateOpen(false);
    } catch (e: any) {
      setJsonError(e.message || "Invalid JSON");
    }
  };

  const handleCopyQuestion = async () => {
    if (!questionContentRef.current || isCopying) return;

    setIsCopying(true);
    try {
      // @ts-ignore - html2canvas is loaded via CDN in index.html
      if (typeof window.html2canvas === "undefined") {
        console.error("html2canvas not loaded");
        setIsCopying(false);
        return;
      }

      const isDark = document.documentElement.classList.contains("dark");

      // @ts-ignore
      const canvas = await window.html2canvas(questionContentRef.current, {
        useCORS: true,
        backgroundColor: isDark ? "#020617" : "#ffffff", // Explicit background color
        scale: 2, // Higher quality
        logging: false,
        onclone: (clonedDoc: Document) => {
          // CRITICAL FIX: Apply dark class to cloned document root if active in real DOM
          // This ensures CSS variables and dark mode overrides apply correctly in the capture
          if (isDark) {
            clonedDoc.documentElement.classList.add("dark");
          }

          const clonedContent = clonedDoc.querySelector(
            '[data-question-content="true"]',
          );
          if (clonedContent) {
            const header = clonedDoc.createElement("div");
            header.style.marginBottom = "20px";
            header.style.paddingBottom = "10px";
            header.style.borderBottom = isDark
              ? "1px solid #1e293b"
              : "1px solid #e2e8f0";
            header.style.display = "flex";
            header.style.justifyContent = "space-between";
            header.style.alignItems = "center";
            header.style.fontFamily = "ui-sans-serif, system-ui, sans-serif";

            const title = clonedDoc.createElement("span");
            title.innerText = `${sectionName} • Q${question.order}`;
            title.style.fontSize = "14px";
            title.style.fontWeight = "600";
            title.style.color = isDark ? "#94a3b8" : "#64748b";
            title.style.textTransform = "uppercase";
            title.style.letterSpacing = "0.05em";

            const branding = clonedDoc.createElement("span");
            branding.innerText = "";
            branding.style.fontSize = "11px";
            branding.style.color = isDark ? "#475569" : "#94a3b8";
            branding.style.fontWeight = "500";

            header.appendChild(title);
            header.appendChild(branding);

            clonedContent.insertBefore(header, clonedContent.firstChild);
          }
        },
      });

      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          navigator.clipboard
            .write([new ClipboardItem({ "image/png": blob })])
            .then(() => {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => {
              console.error("Failed to write to clipboard", err);
            });
        }
        setIsCopying(false);
      }, "image/png");
    } catch (error) {
      console.error("Screenshot failed:", error);
      setIsCopying(false);
    }
  };

  // Helper to style options based on state
  const getOptionClass = (opt: Option) => {
    const isUserSelected = opt.isMarked;
    const isCorrectAnswer = opt.isCorrect;

    // Base styles
    let classes =
      "relative p-4 rounded-lg border-2 transition-all duration-200 flex gap-4 items-start group";

    if (isCorrectAnswer) {
      // Always highlight correct answer in green
      classes +=
        " border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20";
    } else if (isUserSelected && !isCorrectAnswer) {
      // Highlight wrong user selection in red
      classes += " border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20";
    } else {
      // Default style for other options
      classes += " border-border bg-card hover:bg-accent/50";
    }

    return classes;
  };

  const renderStatusBadge = () => {
    if (question.isCorrect) {
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="w-3 h-3" /> Correct
        </Badge>
      );
    }
    if (question.isAttempted && !question.isCorrect) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" /> Incorrect
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <AlertCircle className="w-3 h-3" /> Not Attempted
      </Badge>
    );
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-background overflow-hidden relative">
      {/* Header Info */}
      <div className="flex items-center justify-between p-2 md:px-8 border-b border-border bg-card/50 backdrop-blur-sm z-10 flex-wrap gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="">
            <span className="text-l text-muted-foreground font-semibold uppercase tracking-wider">
              Q
            </span>
            <span className="text-l font-bold text-foreground leading-none">
              {question.order}
            </span>
          </div>
          <div className="h-8 w-px bg-border mx-2"></div>
          {renderStatusBadge()}

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleStar}
            className={cn(
              "ml-2 gap-1.5",
              isStarred
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-muted-foreground",
            )}
          >
            <Star className={cn("w-4 h-4", isStarred ? "fill-current" : "")} />
            <span className="text-xs font-semibold">
              {isStarred ? "Starred" : "Star Question"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUpdateOpen(true)}
            className="ml-1 gap-1.5 text-muted-foreground hover:text-primary"
          >
            <FileJson className="w-4 h-4" />
            <span className="text-xs font-semibold">Update Key</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyQuestion}
            disabled={isCopying}
            className={cn(
              "ml-1 gap-1.5 transition-colors",
              isCopied
                ? "text-emerald-500 hover:text-emerald-600"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {isCopying ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="text-xs font-semibold">
              {isCopied ? "Copied" : "Copy"}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm ml-auto">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-border rounded-md bg-secondary/30 p-1 mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              className="h-7 w-7"
              disabled={zoomLevel <= 0.5}
            >
              <span className="text-xs font-bold">A-</span>
            </Button>
            <div className="w-px h-4 bg-border"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              className="h-7 w-7"
              disabled={zoomLevel >= 2}
            >
              <span className="text-xs font-bold">A+</span>
            </Button>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium uppercase tracking-wider">
              <Clock className="w-3 h-3" /> Time Spent
            </div>
            <span className="font-mono font-medium text-foreground">
              {formatTime(question.timeTaken)}
            </span>
          </div>

          <div className="bg-secondary/50 rounded-md px-3 py-1.5 flex flex-col items-end border border-border">
            <span className="text-[10px] text-muted-foreground font-bold uppercase">
              Marks
            </span>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">
                +{question.marks.positive}
              </span>
              <span className="text-muted-foreground">/</span>
              <span className="text-rose-600 dark:text-rose-400">
                -{question.marks.negative}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full pb-20">
        {/* Container for zooming and capturing */}
        <div
          ref={questionContentRef}
          data-question-content="true"
          className="max-w-5xl mx-auto origin-top-left transition-all duration-200 p-4 rounded-lg bg-background"
          style={{
            // Using zoom property for best browser compatibility with "text and image" scaling simultaneously
            // Although non-standard, it is effective for this specific "A+/A-" requirement on mixed content.
            // Fallback or alternative could be transform: scale() but that affects layout flow differently.
            // @ts-ignore
            zoom: zoomLevel,
          }}
        >
          {/* Question Text */}
          <div className="prose dark:prose-invert max-w-none mb-8">
            {question.isComprehension === true && (
              <div
                className="text-lg leading-relaxed text-foreground [&>img]:max-w-full [&>img]:rounded-lg [&>img]:border [&>img]:border-border [&>p]:mb-4"
                dangerouslySetInnerHTML={{ __html: question.paragraph }}
              />
            )}
            <div
              className="text-lg leading-relaxed text-foreground [&>img]:max-w-full [&>img]:rounded-lg [&>img]:border [&>img]:border-border [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: question.name }}
            />
          </div>

          {/* Options / Input */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {question.type === "multiple_choice" ? "Options" : "Answer"}
            </h3>

            {question.type === "multiple_choice" ? (
              <>
                <div className="grid grid-cols-1 gap-4">
                  {question.options.map((opt, idx) => (
                    <div key={opt._id} className={getOptionClass(opt)}>
                      <div className="flex-shrink-0 mt-0.5">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border",
                            opt.isCorrect
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : opt.isMarked
                                ? "bg-rose-500 border-rose-600 text-white"
                                : "bg-secondary border-border text-muted-foreground group-hover:border-primary/50",
                          )}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div
                          className="prose dark:prose-invert max-w-none [&>p]:m-0 [&>img]:align-middle"
                          dangerouslySetInnerHTML={{ __html: opt.name }}
                        />
                      </div>
                      {opt.isMarked && (
                        <div className="absolute -top-2.5 right-4">
                          <Badge
                            variant={opt.isCorrect ? "success" : "destructive"}
                            className="shadow-sm border"
                          >
                            Your Answer
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
                {/* Integer Type Display */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-secondary/30 rounded-md border border-border">
                      <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                        Correct Answer
                      </span>
                      <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {question.options[0].solution ||
                          question.options[0].nameText ||
                          "--"}
                      </span>
                    </div>

                    <div className="flex-1 p-4 bg-secondary/30 rounded-md border border-border relative">
                      <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                        Your Answer
                      </span>
                      <span
                        className={cn(
                          "text-xl font-mono font-bold",
                          question.options[0].isMarked && question.isCorrect
                            ? "text-emerald-600 dark:text-emerald-400"
                            : question.isAttempted
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-yellow-600 dark:text-yellow-400",
                        )}
                      >
                        {/* Logic to show user answer if marked, else unattempted */}
                        {question.fillUpsAnswers
                          ? question.fillUpsAnswers[0] || "Not attempted"
                          : "--"}
                      </span>
                      {question.options[0].isMarked && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant={
                              question.options[0].isCorrect
                                ? "success"
                                : "destructive"
                            }
                            className="text-[10px] px-1.5 h-5"
                          >
                            {question.options[0].isCorrect
                              ? "Correct"
                              : "Wrong"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Solution Section (if available) */}
          {question.solution && question.solution.trim().length > 60 && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-6">
                <h3 className="flex items-center gap-2 text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-4">
                  <Bookmark className="w-4 h-4" /> Solution
                </h3>
                <div
                  className="prose dark:prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: question.solution }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="border-t border-border bg-card p-4 flex items-center justify-between z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={!hasPrev}
          className="w-32 gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>

        <Button
          variant="default"
          onClick={onNext}
          disabled={!hasNext}
          className="w-32 gap-2"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Key Update Dialog */}
      <Dialog
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title="Update Question Data"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Question JSON
              <span className="text-xs text-muted-foreground font-normal">
                (Edit variables, answer keys, etc.)
              </span>
            </label>
            <textarea
              value={jsonQuestion}
              onChange={(e) => setJsonQuestion(e.target.value)}
              className="w-full h-96 font-mono text-sm p-4 rounded-md border border-input bg-muted/50 focus:ring-2 focus:ring-primary focus:outline-none"
              spellCheck={false}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Section Stats JSON
              <span className="text-xs text-muted-foreground font-normal">
                (Update section totals if marks changed)
              </span>
            </label>
            {sectionStats ? (
              <textarea
                value={jsonStats}
                onChange={(e) => setJsonStats(e.target.value)}
                className="w-full h-48 font-mono text-sm p-4 rounded-md border border-input bg-muted/50 focus:ring-2 focus:ring-primary focus:outline-none"
                spellCheck={false}
              />
            ) : (
              <div className="p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                No section stats available for this question's section.
              </div>
            )}
          </div>

          {jsonError && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {jsonError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveJson} className="gap-2">
              <Save className="w-4 h-4" /> Update & Export
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
