import React from "react";
import { Section, Question, SectionStats } from "../types";
import { cn } from "../utils";
import { Badge } from "./ui/Badge";
import { Star } from "lucide-react";

interface SidebarProps {
  sections: Section[];
  stats?: SectionStats[];
  selectedQuestionId: string | null;
  onQuestionSelect: (id: string) => void;
  starredQuestions: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sections,
  stats,
  selectedQuestionId,
  onQuestionSelect,
  starredQuestions,
}) => {
  // Helper to determine the status color of a question button
  const getQuestionStatusClass = (q: Question, isSelected: boolean) => {
    // Reduced size: w-7 h-7 instead of w-8 h-8
    const baseClasses =
      "relative aspect-square md:aspect-auto md:w-9 md:h-9 rounded-md flex items-center justify-center text-[10px] md:text-xs font-medium transition-all duration-200 border";

    if (isSelected) {
      return cn(
        baseClasses,
        "ring-2 ring-primary ring-offset-2 ring-offset-background border-primary bg-primary text-primary-foreground font-bold shadow-md transform scale-105 z-10",
      );
    }

    // Status Logic
    // 1. Correct -> Green
    if (q.isCorrect) {
      return cn(
        baseClasses,
        "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600",
      );
    }

    // 2. Partially Correct -> Yellow
    if (q.isPartiallyCorrect) {
      return cn(
        baseClasses,
        "bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500",
      );
    }

    // 3. Incorrect -> Red (Attempted but not correct and not partial)
    if (q.isAttempted && !q.isCorrect && !q.isPartiallyCorrect) {
      return cn(
        baseClasses,
        "bg-rose-500 text-white border-rose-600 hover:bg-rose-600",
      );
    }

    // 4. Unattempted / Default -> Grey
    // We removed the specific background for "Marked for Review". Review status is now just a dot overlay.
    return cn(
      baseClasses,
      "bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80",
    );
  };

  const getSectionScore = (sectionId: string) => {
    if (!stats) return null;
    const stat = stats.find((s) => s.sectionId === sectionId);
    return stat ? { scored: stat.marksScored, total: stat.sectionMarks } : null;
  };

  return (
    <aside className="w-full md:w-72 border-r border-border bg-card h-[calc(100vh-4rem)] flex-shrink-0 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/20">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-1">
          Question Palette
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {sections.map((section) => {
          const score = getSectionScore(section._id);
          return (
            <div key={section._id} className="space-y-3">
              <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur py-2 z-10 border-b border-dashed border-border">
                <h3
                  className="font-medium text-xs text-foreground truncate max-w-[130px]"
                  title={section.name}
                >
                  {section.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 gap-1 font-normal text-muted-foreground bg-background whitespace-nowrap"
                >
                  {score ? (
                    <span>
                      {score.scored}/{score.total}
                    </span>
                  ) : (
                    <span>{section.sectionMarks} Marks</span>
                  )}
                </Badge>
              </div>

              <div className="grid grid-cols-5 md:grid-cols-6 gap-2">
                {section.questions.map((q) => (
                  <button
                    key={q._id}
                    onClick={() => onQuestionSelect(q._id)}
                    className={getQuestionStatusClass(
                      q,
                      selectedQuestionId === q._id,
                    )}
                  >
                    {starredQuestions.has(q._id) && (
                      <Star
                        className={cn(
                          "absolute -top-1 -right-1 w-2.5 h-2.5 fill-yellow-400 text-yellow-600 drop-shadow-sm z-20",
                          selectedQuestionId === q._id ? "text-yellow-300" : "",
                        )}
                      />
                    )}

                    {/* Review Indicator Dot */}
                    {q.markForReview && (
                      <div
                        className={cn(
                          "absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-sm z-10",
                          selectedQuestionId === q._id ? "bg-purple-200" : "",
                        )}
                      />
                    )}

                    {q.order}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
