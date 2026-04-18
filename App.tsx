import React, { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { Sidebar } from "./components/Sidebar";
import { QuestionView } from "./components/QuestionView";
import { PrintWorkbook } from "./components/PrintWorkbook";
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
      const data = MOCK_TEST_DATA[testMeta.fileName];
      setTestData(data);

      if (
        data &&
        data.data.sections.length > 0 &&
        data.data.sections[0].questions.length > 0
      ) {
        setSelectedQuestionId(data.data.sections[0].questions[0]._id);
      }

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

  const handleToggleStar = () => {
    if (!selectedQuestionId) return;
    const newStarred = new Set(starredQuestions);
    if (newStarred.has(selectedQuestionId)) {
      newStarred.delete(selectedQuestionId);
    } else {
      newStarred.add(selectedQuestionId);
    }
    setStarredQuestions(newStarred);
    localStorage.setItem(
      `starred_questions_${currentTestId}`,
      JSON.stringify(Array.from(newStarred)),
    );
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5));

  const handleExportPDF = () => {
    // Native Browser Print - Uses the real browser engine for perfect layout
    window.print();
  };

  // Navigation Logic
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

    let currentSectionStats: SectionStats | null = null;
    if (currentQuestion && testData.data.sectionWiseStats) {
      currentSectionStats =
        testData.data.sectionWiseStats.find(
          (s) => s.sectionId === currentQuestion.sectionId,
        ) || null;
    }

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

  const handleUpdateData = (
    updatedQuestion: Question,
    updatedStats: SectionStats | null,
  ) => {
    if (!testData) return;
    const newData = JSON.parse(JSON.stringify(testData));
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
    if (updatedStats && newData.data.sectionWiseStats) {
      const statIndex = newData.data.sectionWiseStats.findIndex(
        (s: SectionStats) => s.sectionId === updatedStats.sectionId,
      );
      if (statIndex !== -1) {
        newData.data.sectionWiseStats[statIndex] = updatedStats;
      }
    }
    setTestData(newData);
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
      {/* TopBar - no-print class ensures it stays out of the PDF */}
      <div className="no-print">
        <TopBar
          currentTestId={currentTestId}
          onTestSelect={setCurrentTestId}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          onExportPDF={handleExportPDF}
          isExporting={false}
          exportProgress={null}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden automatically by @media print */}
        <div className="hidden md:block h-full no-print">
          <Sidebar
            sections={testData.data.sections}
            stats={testData.data.sectionWiseStats}
            selectedQuestionId={selectedQuestionId}
            onQuestionSelect={setSelectedQuestionId}
            starredQuestions={starredQuestions}
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 relative no-print">
          {currentQuestion ? (
            <QuestionView
              question={currentQuestion}
              sectionName={currentSectionName}
              isStarred={starredQuestions.has(currentQuestion._id)}
              onToggleStar={handleToggleStar}
              zoomLevel={zoomLevel}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              hasNext={!!nextQuestionId}
              hasPrev={!!prevQuestionId}
              onNext={() =>
                nextQuestionId && setSelectedQuestionId(nextQuestionId)
              }
              onPrev={() =>
                prevQuestionId && setSelectedQuestionId(prevQuestionId)
              }
              sectionStats={currentSectionStats}
              onUpdateData={handleUpdateData}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a question to view details
            </div>
          )}
        </main>
      </div>

      {/* The "Real Browser" Print Layout */}
      <PrintWorkbook testData={testData} />
    </div>
  );
};

export default App;
