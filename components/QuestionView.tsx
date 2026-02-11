import React from "react";
import { Question, Option } from "../types";
import { cn, formatTime } from "../utils";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
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
} from "lucide-react";

interface QuestionViewProps {
  question: Question;
  isStarred: boolean;
  onToggleStar: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  question,
  isStarred,
  onToggleStar,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
}) => {
  // Determine user's selected option (if any)
  const userSelectedOption = question.options.find((opt) => opt.isMarked);

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
              Marks+
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
        {/* Container for zooming */}
        <div
          className="max-w-5xl mx-auto origin-top-left transition-all duration-200"
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
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4">
                {/* Integer Type Display */}
                {question.options.map((opt) => (
                  <div key={opt._id} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 p-4 bg-secondary/30 rounded-md border border-border">
                        <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                          Correct Answer
                        </span>
                        <span className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {opt.solution || opt.nameText}
                        </span>
                      </div>

                      <div className="flex-1 p-4 bg-secondary/30 rounded-md border border-border relative">
                        <span className="text-xs text-muted-foreground uppercase font-bold block mb-1">
                          Your Answer
                        </span>
                        <span
                          className={cn(
                            "text-xl font-mono font-bold",
                            opt.isMarked && opt.isCorrect
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400",
                          )}
                        >
                          {/* Logic to show user answer if marked, else unattempted */}
                          {opt.isMarked ? opt.nameText : "--"}
                        </span>
                        {opt.isMarked && (
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant={
                                opt.isCorrect ? "success" : "destructive"
                              }
                              className="text-[10px] px-1.5 h-5"
                            >
                              {opt.isCorrect ? "Correct" : "Wrong"}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
    </div>
  );
};
