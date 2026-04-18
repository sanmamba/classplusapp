import React, { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { QuestionView } from "./components/QuestionView";
import { TESTS, MOCK_TEST_DATA } from "./constants";
import { TestData, Question, Section, SectionStats } from "./types";

const App: React.FC = () => {
  const [currentTestId, setCurrentTestId] = useState(
    TESTS[TESTS.length - 1].id,
  );
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
  const {
    currentQuestion,
    nextQuestionId,
    prevQuestionId,
    currentSectionStats,
    currentSectionName,
  } = React.useMemo(() => {
    if (!testData || !selectedQuestionId)
      return {
        currentQuestion: null,
        nextQuestionId: null,
        prevQuestionId: null,
        currentSectionStats: null,
        currentSectionName: "",
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

    // Find section stats
    let currentSectionStats: SectionStats | null = null;
    if (currentQuestion && testData.data.sectionWiseStats) {
      currentSectionStats =
        testData.data.sectionWiseStats.find(
          (s) => s.sectionId === currentQuestion.sectionId,
        ) || null;
    }

    // Find section name
    const currentSection = testData.data.sections.find(
      (s) => s._id === currentQuestion?.sectionId,
    );
    const currentSectionName = currentSection ? currentSection.name : "";

    return {
      currentQuestion,
      nextQuestionId,
      prevQuestionId,
      currentSectionStats,
      currentSectionName,
    };
  }, [testData, selectedQuestionId]);

  // Handle Data Update (Key Change)
  const handleDataUpdate = (
    updatedQuestion: Question,
    updatedSectionStats: SectionStats | null,
  ) => {
    if (!testData) return;

    // Create a deep copy
    const newData = JSON.parse(JSON.stringify(testData));

    // Update Question
    // Find the section that contains this question
    // We assume updatedQuestion.sectionId is correct.
    const sectionIndex = newData.data.sections.findIndex(
      (s: Section) => s._id === updatedQuestion.sectionId,
    );
    if (sectionIndex !== -1) {
      const qIndex = newData.data.sections[sectionIndex].questions.findIndex(
        (q: Question) => q._id === updatedQuestion._id,
      );
      if (qIndex !== -1) {
        newData.data.sections[sectionIndex].questions[qIndex] = updatedQuestion;
      }
    }

    // Update Stats
    if (updatedSectionStats && newData.data.sectionWiseStats) {
      const statIndex = newData.data.sectionWiseStats.findIndex(
        (s: SectionStats) => s.sectionId === updatedSectionStats.sectionId,
      );
      if (statIndex !== -1) {
        newData.data.sectionWiseStats[statIndex] = updatedSectionStats;
      }
    }

    setTestData(newData);

    // Export complete new JSON
    const fileName =
      TESTS.find((t) => t.id === currentTestId)?.fileName ||
      "updated_test_data.json";
    const blob = new Blob([JSON.stringify(newData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "updated-" + fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
              sectionName={currentSectionName}
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
              sectionStats={currentSectionStats}
              onUpdateData={handleDataUpdate}
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
