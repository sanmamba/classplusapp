import React from "react";
import { TestData } from "../types";
import { ExportTemplate } from "./ExportTemplate";
import { getSubjectFromSectionName, filterIncorrectQuestions } from "../utils/pdfGenerator";

interface PrintWorkbookProps {
  testData: TestData;
}

export const PrintWorkbook: React.FC<PrintWorkbookProps> = ({ testData }) => {
  const filteredItems = filterIncorrectQuestions(testData);

  return (
    <div className="print-container hidden">
      {/* 1. First Blank Page (trial.py logic) */}
      <div className="print-page-break h-screen bg-white"></div>

      {/* 2. Questions Pages */}
      {filteredItems.map((item, index) => (
        <div key={item.question._id} className="print-page-break bg-white">
          <ExportTemplate
            question={item.question}
            sectionName={item.sectionName}
            subject={item.subject}
          />
        </div>
      ))}
    </div>
  );
};
