import { jsPDF } from "jspdf";
import { TestData, Question } from "./types";

export const getSubjectFromSectionName = (sectionName: string): string => {
  const name = sectionName.toLowerCase();
  if (name.includes("physics")) return "Physics";
  if (name.includes("chemistry")) return "Chemistry";
  if (
    name.includes("maths") ||
    name.includes("math") ||
    name.includes("mathematics")
  )
    return "Mathematics";
  return "Unknown";
};

export const filterIncorrectQuestions = (testData: TestData): { question: Question, sectionName: string, subject: string }[] => {
  const filtered: { question: Question, sectionName: string, subject: string }[] = [];

  testData.data.sections.forEach((section) => {
    const subject = getSubjectFromSectionName(section.name);
    if (subject === "Unknown") return;

    section.questions.forEach((q) => {
      const isIncorrect = q.isCorrect === false;
      const isPartiallyCorrect = q.isPartiallyCorrect === true;
      const isGraceMarked = q.isGraceMarked === true;

      if ((isIncorrect || isPartiallyCorrect) && !isGraceMarked) {
        filtered.push({
          question: q,
          sectionName: section.name,
          subject: subject,
        });
      }
    });
  });

  return filtered;
};

export const generatePDF = async (
  testData: TestData,
  testName: string,
  onProgress: (current: number, total: number) => void
) => {
  const filteredItems = filterIncorrectQuestions(testData);
  if (filteredItems.length === 0) {
    alert("No incorrect or partially correct questions found to export.");
    return;
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page 1 is blank (as requested)

  for (let i = 0; i < filteredItems.length; i++) {
    const { question, sectionName, subject } = filteredItems[i];
    onProgress(i + 1, filteredItems.length);

    const element = document.getElementById(`export-question-${question._id}`);
    if (!element) continue;

    doc.addPage();

    try {
      // Add a small delay to allow images and LaTeX to render fully
      await new Promise((resolve) => setTimeout(resolve, 500));

      // @ts-ignore
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      
      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const aspectRatio = imgHeightPx / imgWidthPx;

      let finalWidth = 175;
      let finalHeight = finalWidth * aspectRatio;

      if (finalHeight > 130) {
        finalHeight = 130;
        finalWidth = finalHeight / aspectRatio;
      }

      // --- 1. HEADER (Directly from trial.py logic) ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(subject, 12, 8); 
      
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(10, 10, 200, 10);

      // --- 2. IMAGE PLACEMENT ---
      const xLeftMargin = 25;
      const yImageStart = 14;
      doc.addImage(imgData, "JPEG", xLeftMargin, yImageStart, finalWidth, finalHeight);

      // --- 3. TABS SECTION (Directly from trial.py logic) ---
      const yImageBottom = yImageStart + finalHeight;
      const yTabStart = yImageBottom + 5;
      
      const tabOptions = ["Silly", "Easy", "Time", "Concept", "Key", "Others"];
      const tabWidth = 18;
      const tabHeight = 6;
      const tabSpacing = 4;
      
      const totalTabsWidth = tabOptions.length * tabWidth + (tabOptions.length - 1) * tabSpacing;
      const startX = (210 - totalTabsWidth) / 2;

      for (let j = 0; j < tabOptions.length; j++) {
        const xPos = startX + (j * (tabWidth + tabSpacing));
        
        // Explicitly set colors for each box to ensure no bleed or incorrect overrides
        doc.setLineWidth(0.3);
        doc.setDrawColor(80, 80, 180);   // Blue border
        doc.setFillColor(245, 245, 255); // Light fill
        
        // Draw rectangle
        doc.rect(xPos, yTabStart, tabWidth, tabHeight, "FD");
        
        // Draw text
        doc.setFontSize(7);
        doc.setTextColor(40, 40, 120);   // Dark blue text
        doc.text(tabOptions[j], xPos + (tabWidth / 2), yTabStart + 4, { align: "center" });
      }

      // --- 4. SEPARATOR LINES (Directly from trial.py logic) ---
      const yLine1 = yTabStart + tabHeight + 3;
      const yLine2 = yLine1 + 2;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.1);

      if (yLine2 < 285) {
        doc.line(10, yLine1, 200, yLine1);
        doc.line(10, yLine2, 200, yLine2);
      }

    } catch (error) {
      console.error(`Error capturing question ${question._id}:`, error);
    }
  }

  doc.save(`${testName.replace(/\s+/g, "_")}_Incorrect_Questions.pdf`);
};
