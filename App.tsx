import React, { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { QuestionView } from "./components/QuestionView";
import { TESTS, MOCK_TEST_DATA } from "./constants";
import { TestData, Question } from "./types";

const App: React.FC = () => {
  const [currentTestId, setCurrentTestId] = useState(TESTS[0].id);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null,
  );
  const [isDarkMode, setIsDarkMode] = useState(false);

  // New features state
  const [starredQuestions, setStarredQuestions] = useState<Set<string>>(
    new Set(),
  );
  const [zoomLevel, setZoomLevel] = useState(1);

  // Load Test Data
  useEffect(() => {
    const testMeta = TESTS.find((t) => t.id === currentTestId);
    if (testMeta) {
      // Fetch data from the constants map
      const data = MOCK_TEST_DATA[testMeta.fileName];
      setTestData(data);

      // Default select first question of first section if not already selected or if switched
      if (
        data &&
        data.data.sections.length > 0 &&
        data.data.sections[0].questions.length > 0
      ) {
        setSelectedQuestionId(data.data.sections[0].questions[0]._id);
      }

      // Load starred questions for this test from localStorage
      const storedStars = localStorage.getItem(
        `starred_questions_${currentTestId}`,
      );
      if (storedStars) {
        try {
          setStarredQuestions(new Set(JSON.parse(storedStars)));
        } catch (e) {
          console.error("Failed to parse starred questions", e);
          setStarredQuestions(new Set());
        }
      } else {
        setStarredQuestions(new Set());
      }
    }
  }, [currentTestId]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Toggle star handler
  const handleToggleStar = () => {
    if (!selectedQuestionId) return;

    const newStarred = new Set(starredQuestions);
    if (newStarred.has(selectedQuestionId)) {
      newStarred.delete(selectedQuestionId);
    } else {
      newStarred.add(selectedQuestionId);
    }

    setStarredQuestions(newStarred);
    // Persist
    localStorage.setItem(
      `starred_questions_${currentTestId}`,
      JSON.stringify(Array.from(newStarred)),
    );
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  // Find current question object and navigation logic
  const { currentQuestion, nextQuestionId, prevQuestionId } =
    React.useMemo(() => {
      if (!testData || !selectedQuestionId)
        return {
          currentQuestion: null,
          nextQuestionId: null,
          prevQuestionId: null,
        };

      // Flatten all questions to linearize navigation
      const allQuestions: Question[] = [];
      testData.data.sections.forEach((s) => allQuestions.push(...s.questions));

      const currentIndex = allQuestions.findIndex(
        (q) => q._id === selectedQuestionId,
      );
      const currentQuestion = allQuestions[currentIndex] || null;

      const nextQuestionId =
        currentIndex < allQuestions.length - 1
          ? allQuestions[currentIndex + 1]._id
          : null;
      const prevQuestionId =
        currentIndex > 0 ? allQuestions[currentIndex - 1]._id : null;

      return { currentQuestion, nextQuestionId, prevQuestionId };
    }, [testData, selectedQuestionId]);

  if (!testData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <TopBar
        currentTestId={currentTestId}
        onTestSelect={setCurrentTestId}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block h-full">
          <Sidebar
            sections={testData.data.sections}
            stats={testData.data.sectionWiseStats}
            selectedQuestionId={selectedQuestionId}
            onQuestionSelect={setSelectedQuestionId}
            starredQuestions={starredQuestions}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 relative">
          {currentQuestion ? (
            <QuestionView
              question={currentQuestion}
              isStarred={starredQuestions.has(currentQuestion._id)}
              onToggleStar={handleToggleStar}
              zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onNext={
                nextQuestionId
                  ? () => setSelectedQuestionId(nextQuestionId)
                  : undefined
              }
              onPrev={
                prevQuestionId
                  ? () => setSelectedQuestionId(prevQuestionId)
                  : undefined
              }
              hasNext={!!nextQuestionId}
              hasPrev={!!prevQuestionId}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a question to view details
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
