#!/usr/bin/env python3
"""
Question Screenshot Extractor - Fixed Version
Uses a headless browser to render complete questions as screenshots
(similar to the website's copy function) for questions where Correct = False
and organizes them by subject (Physics, Chemistry, Mathematics)
"""

import json
import os
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
from playwright.async_api import async_playwright, Browser, Page

class QuestionScreenshotExtractor:
    def __init__(self, tests_dir: str = "tests", output_dir: str = "question_screenshots"):
        self.tests_dir = Path(tests_dir)
        self.output_dir = Path(output_dir)
        
        # Create output directories for each subject
        self.subjects = ["Physics", "Chemistry", "Mathematics"]
        for subject in self.subjects:
            (self.output_dir / subject).mkdir(parents=True, exist_ok=True)
    
    def get_test_files(self) -> List[Path]:
        """Get all JSON test files in the tests directory"""
        return list(self.tests_dir.glob("*.json"))
    
    def find_test_by_name(self, test_name: str) -> Path:
        """Find test file by partial name match"""
        test_files = self.get_test_files()
        
        # Remove .json extension if provided
        test_name_clean = test_name.replace('.json', '')
        
        # Try exact match first
        for file in test_files:
            if test_name_clean in file.stem:
                return file
        
        # If no exact match, try case-insensitive partial match
        test_name_lower = test_name_clean.lower()
        for file in test_files:
            if test_name_lower in file.stem.lower():
                return file
        
        # Provide helpful error message with available files
        available_files = [f.stem for f in test_files]
        raise FileNotFoundError(f"Test file containing '{test_name}' not found in {self.tests_dir}\nAvailable files: {', '.join(available_files)}")
    
    def get_subject_from_section_name(self, section_name: str) -> str:
        """Extract subject name from section name"""
        section_name = section_name.lower()
        if "physics" in section_name:
            return "Physics"
        elif "chemistry" in section_name:
            return "Chemistry"
        elif "maths" in section_name or "math" in section_name or "mathematics" in section_name:
            return "Mathematics"
        else:
            return "Unknown"
    
    def safe_get(self, obj: Dict, key: str, default=None):
        """Safely get value from dictionary"""
        if obj is None:
            return default
        return obj.get(key, default)
    
    def safe_get_nested(self, obj: Dict, keys: List[str], default=None):
        """Safely get nested value from dictionary"""
        current = obj
        for key in keys:
            if current is None:
                return default
            current = current.get(key) if isinstance(current, dict) else None
            if current is None:
                return default
        return current if current is not None else default
    
    def create_question_html(self, question: Dict, section_name: str, question_number: int) -> str:
        """Create HTML representation of a question for screenshotting"""
        
        # Safely get question properties
        is_correct = self.safe_get(question, 'isCorrect', True)
        is_attempted = self.safe_get(question, 'isAttempted', False)
        is_partially_correct = self.safe_get(question, 'isPartiallyCorrect', False)
        is_comprehension = self.safe_get(question, 'isComprehension', False)
        
        # Determine status and color
        if is_correct:
            status_color = "emerald"
            status_text = "Correct"
        elif is_partially_correct:
            status_color = "yellow"
            status_text = "Partially Correct"
        elif is_attempted:
            status_color = "rose"
            status_text = "Incorrect"
        else:
            status_color = "yellow"
            status_text = "Not Attempted"
        
        # Get question text and options
        question_text = self.safe_get(question, 'name', '')
        paragraph_text = self.safe_get(question, 'paragraph', '')
        options = self.safe_get(question, 'options', [])
        question_type = self.safe_get(question, 'type', 'multiple_choice')
        
        # Build question content
        question_content = ""
        
        # Add comprehension paragraph/image first if it exists
        if is_comprehension and paragraph_text:
            question_content += f'''
            <div class="comprehension" style="
                margin-bottom: 20px;
                padding: 16px;
                background: #f8fafc;
                border-left: 4px solid #3b82f6;
                border-radius: 8px;
            ">
                <div style="
                    font-size: 12px;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                ">Comprehension</div>
                <div style="line-height: 1.6;">
                    {paragraph_text}
                </div>
            </div>'''
        
        # Add the actual question
        question_content += f'''
        <div class="question-text" style="
            margin-bottom: 20px;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.6;
            color: #111827;
        ">
            {question_text}
        </div>'''
        
        # Create HTML for options
        options_html = ""
        if question_type == "multiple_choice":
            for i, option in enumerate(options):
                option_letter = chr(65 + i)  # A, B, C, D
                is_correct_option = self.safe_get(option, 'isCorrect', False)
                is_marked_option = self.safe_get(option, 'isMarked', False)
                
                option_class = "border-emerald-500/50 bg-emerald-50/50" if is_correct_option else \
                             "border-rose-500/50 bg-rose-50/50" if (is_marked_option and not is_correct_option) else \
                             "border-gray-300 bg-gray-50"
                
                option_color = self._get_option_color(is_correct_option, is_marked_option)
                
                # Build option HTML step by step
                option_html = f'''
                <div class="option" style="
                    border: 2px solid;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    position: relative;
                    {option_class};
                ">
                    <div style="
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        font-size: 12px;
                        border: 2px solid;
                        flex-shrink: 0;
                        background: {option_color};
                        color: white;
                    ">{option_letter}</div>
                    <div style="flex: 1;">
                        {self.safe_get(option, 'name', '')}
                    </div>'''
                
                if is_marked_option and not is_correct_option:
                    option_html += '''
                    <div style="
                        position: absolute;
                        top: -10px;
                        right: 16px;
                        background: #dc2626;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                    ">Your Answer</div>'''
                elif is_marked_option and is_partially_correct:
                    option_html += '''
                    <div style="
                        position: absolute;
                        top: -10px;
                        right: 16px;
                        background: #d97706;
                        color: white;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: bold;
                    ">Your Answer</div>'''
                
                option_html += "</div>"
                options_html += option_html
        else:
            # Integer type questions
            correct_answer = ""
            user_answer = ""
            
            if options and len(options) > 0:
                correct_answer = self.safe_get(options[0], 'solution', '')
            
            fill_ups_answers = self.safe_get(question, 'fillUpsAnswers', [])
            if fill_ups_answers and len(fill_ups_answers) > 0:
                user_answer = fill_ups_answers[0]
            
            answer_color = '#059669' if is_correct else '#dc2626' if is_attempted and not is_partially_correct else '#d97706'
            
            badge_html = ''
            if is_attempted:
                if is_correct:
                    badge_color = '#059669'
                    badge_text = 'Correct'
                elif is_partially_correct:
                    badge_color = '#d97706'
                    badge_text = 'Partially Correct'
                else:
                    badge_color = '#dc2626'
                    badge_text = 'Wrong'
                    
                badge_html = f'''
                <div style="
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: {badge_color};
                    color: white;
                    padding: 4px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: bold;
                ">{badge_text}</div>'''
            
            options_html = f'''
            <div style="
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 24px;
                background: #f9fafb;
            ">
                <div style="display: flex; gap: 24px;">
                    <div style="flex: 1;">
                        <div style="font-size: 12px; color: #6b7280; font-weight: bold; margin-bottom: 4px;">CORRECT ANSWER</div>
                        <div style="font-size: 20px; font-family: monospace; font-weight: bold; color: #059669;">{correct_answer or '--'}</div>
                    </div>
                    <div style="flex: 1; position: relative;">
                        <div style="font-size: 12px; color: #6b7280; font-weight: bold; margin-bottom: 4px;">YOUR ANSWER</div>
                        <div style="font-size: 20px; font-family: monospace; font-weight: bold; color: {answer_color};">
                            {user_answer or 'Not attempted'}
                        </div>
                        {badge_html}
                    </div>
                </div>
            </div>
            '''
        
        # Safely get marks
        marks_obj = self.safe_get(question, 'marks', {})
        positive_marks = self.safe_get(marks_obj, 'positive', 0)
        negative_marks = self.safe_get(marks_obj, 'negative', 0)
        time_taken = self.safe_get(question, 'timeTaken', 0)
        
        # Complete HTML document
        html_template = f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * {{
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    margin: 0;
                    padding: 24px;
                    background: white;
                    color: #111827;
                    line-height: 1.6;
                }}
                
                .header {{
                    margin-bottom: 24px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }}
                
                .title {{
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }}
                
                .status {{
                    background: #{self._get_status_color(status_color)};
                    color: white;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }}
                
                .question-text {{
                    font-size: 18px;
                    margin-bottom: 24px;
                    line-height: 1.7;
                }}
                
                .question-content {{
                    margin-bottom: 24px;
                }}
                
                .comprehension {{
                    margin-bottom: 20px;
                    padding: 16px;
                    background: #f8fafc;
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
                }}
                
                .comprehension-title {{
                    font-size: 12px;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }}
                
                .question-text img {{
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 8px 0;
                }}
                
                .comprehension img {{
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 8px 0;
                }}
                
                .answer-box {{
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    margin: 8px 0;
                }}
                
                .options-title {{
                    font-size: 14px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }}
                
                .option {{
                    position: relative;
                }}
                
                .option img {{
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                }}
                
                .marks {{
                    margin-top: 24px;
                    padding: 12px;
                    background: #f3f4f6;
                    border-radius: 8px;
                    font-size: 14px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }}
                
                .marks-item {{
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }}
                
                .positive {{
                    color: #059669;
                    font-weight: 600;
                }}
                
                .negative {{
                    color: #dc2626;
                    font-weight: 600;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">{section_name} • Q{question_number}</div>
                <div class="status">{status_text}</div>
            </div>
            
            <div class="question-content">
                {question_content}
            </div>
            
            <div class="options-title">Options</div>
            {options_html}
            
            <div class="marks">
                <div class="marks-item">
                    <span>Marks:</span>
                    <span class="positive">+{positive_marks}</span>
                    <span>/</span>
                    <span class="negative">-{negative_marks}</span>
                </div>
                <div class="marks-item">
                    <span>Time: {self._format_time(time_taken)}</span>
                </div>
            </div>
        </body>
        </html>
        '''
        
        return html_template
    
    def _get_option_color(self, is_correct: bool, is_marked: bool) -> str:
        """Get background color for option indicator"""
        if is_correct:
            return "#059669"  # emerald-600
        elif is_marked and not is_correct:
            return "#dc2626"  # rose-600
        else:
            return "#6b7280"  # gray-500
    
    def _get_status_color(self, status: str) -> str:
        """Get status color"""
        colors = {
            "emerald": "059669",
            "rose": "dc2626", 
            "yellow": "d97706"
        }
        return colors.get(status, "6b7280")
    
    def _format_time(self, time_ms: int) -> str:
        """Format time in milliseconds to readable format"""
        if time_ms < 1000:
            return f"{time_ms}ms"
        elif time_ms < 60000:
            return f"{time_ms // 1000}s"
        else:
            minutes = time_ms // 60000
            seconds = (time_ms % 60000) // 1000
            return f"{minutes}m {seconds}s"
    
    async def capture_question_screenshot(self, browser: Browser, question: Dict, section_name: str, question_number: int, subject: str) -> Optional[bytes]:
        """Capture screenshot of a single question"""
        try:
            page = await browser.new_page()
            
            # Set smaller viewport for faster rendering
            await page.set_viewport_size({"width": 800, "height": 600})
            
            # Create HTML content
            html_content = self.create_question_html(question, section_name, question_number)
            
            # Set content and wait for it to load
            await page.set_content(html_content)
            
            # Reduced wait times for faster processing
            await page.wait_for_load_state('domcontentloaded')
            await page.wait_for_timeout(500)  # Reduced from 2000ms
            
            # Get screenshot with optimized settings
            screenshot = await page.screenshot(
                type='jpeg',  # JPEG is faster than PNG
                quality=85,   # Good quality but faster
                full_page=True
            )
            
            await page.close()
            print(f"    Screenshot captured successfully, size: {len(screenshot)} bytes")
            return screenshot
            
        except Exception as e:
            print(f"Error capturing screenshot for question {question_number}: {e}")
            return None
    
    async def process_test_file_async(self, test_file: Path) -> Dict:
        """Process a single test file and capture screenshots for incorrect answers"""
        print(f"\nProcessing test file: {test_file.name}")
        
        try:
            with open(test_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            print(f"Error reading {test_file}: {e}")
            return {"error": str(e)}
        
        # Safely get test name
        test_name = self.safe_get_nested(data, ["data", "test", "name"], "Unknown")
        
        results = {
            "test_name": test_name,
            "subjects_processed": {},
            "total_screenshots_captured": 0,
            "incorrect_questions_found": 0
        }
        
        # Launch browser with performance optimizations
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    '--disable-extensions',
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--no-sandbox',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            )
            
            # Safely get sections
            sections = self.safe_get_nested(data, ["data", "sections"], [])
            question_counter = 1
            
            for section in sections:
                section_name = self.safe_get(section, 'name', 'Unknown')
                subject = self.get_subject_from_section_name(section_name)
                
                if subject == "Unknown":
                    continue
                
                print(f"\nProcessing section: {section_name} (Subject: {subject})")
                
                subject_results = {
                    "incorrect_questions": 0,
                    "screenshots_captured": 0
                }
                
                questions = self.safe_get(section, 'questions', [])
                
                for question in questions:
                    # Check if question was answered incorrectly or partially correct
                    is_correct = self.safe_get(question, 'isCorrect', True)
                    is_partially_correct = self.safe_get(question, 'isPartiallyCorrect', False)
                    is_grace_marked = self.safe_get(question, 'isGraceMarked', False)
                    
                    # Debug: show question status
                    print(f"    Question {question_counter}: isCorrect = {is_correct}, isPartiallyCorrect = {is_partially_correct}, isGraceMarked = {is_grace_marked}")
                    
                    # Skip grace marked questions regardless of correctness
                    if is_grace_marked:
                        print(f"    Skipping Question {question_counter} (grace marked)")
                        question_counter += 1
                        continue
                    
                    # Capture questions where isCorrect is explicitly false OR isPartiallyCorrect is true
                    if is_correct is False or is_partially_correct is True:
                        subject_results["incorrect_questions"] += 1
                        results["incorrect_questions_found"] += 1
                        
                        status_msg = "Partially Correct" if is_partially_correct else "Incorrect"
                        print(f"  Capturing screenshot for Question {question_counter}: {status_msg}")
                        
                        # Capture screenshot
                        screenshot_data = await self.capture_question_screenshot(
                            browser, question, section_name, question_counter, subject
                        )
                        
                        if screenshot_data:
                            # Save screenshot
                            filename = f"Q{question_counter}_Screenshot.jpg"
                            output_path = self.output_dir / subject / filename
                            
                            with open(output_path, 'wb') as f:
                                f.write(screenshot_data)
                            
                            subject_results["screenshots_captured"] += 1
                            results["total_screenshots_captured"] += 1
                            print(f"    Saved: {output_path}")
                    else:
                        print(f"    Skipping Question {question_counter} (not incorrect or partially correct)")
                    
                    question_counter += 1
                
                results["subjects_processed"][subject] = subject_results
            
            await browser.close()
        
        return results
    
    def process_test_file(self, test_file: Path) -> Dict:
        """Synchronous wrapper for async processing"""
        return asyncio.run(self.process_test_file_async(test_file))
    
    def run_interactive(self):
        """Run the extractor in interactive mode"""
        print("=== Question Screenshot Extractor (Fixed) ===")
        print("This tool captures complete question screenshots (like the website's copy function)")
        print("for incorrectly answered questions and organizes them by subject\n")
        
        # Show available test files
        test_files = self.get_test_files()
        if not test_files:
            print("No test files found in the tests directory!")
            return
        
        print("Available test files:")
        for i, file in enumerate(test_files, 1):
            print(f"  {i}. {file.name}")
        
        # Get test name from user
        test_name = input("\nEnter test name (without .json extension, partial matching supported): ").strip()
        
        if not test_name:
            print("Please enter a test name!")
            return
        
        try:
            test_file = self.find_test_by_name(test_name)
            print(f"\nSelected test file: {test_file.name}")
        except FileNotFoundError as e:
            print(f"Error: {e}")
            return
        
        # Ask for output directory
        custom_output = input(f"\nEnter output directory (default: {self.output_dir}): ").strip()
        if custom_output:
            self.output_dir = Path(custom_output)
            # Recreate directories with new path
            for subject in self.subjects:
                (self.output_dir / subject).mkdir(parents=True, exist_ok=True)
        
        print("\nStarting screenshot extraction... (this may take a few minutes)")
        
        # Process the test file
        results = self.process_test_file(test_file)
        
        # Display results
        print(f"\n=== EXTRACTION RESULTS ===")
        print(f"Test: {results['test_name']}")
        print(f"Total incorrect questions found: {results['incorrect_questions_found']}")
        print(f"Total screenshots captured: {results['total_screenshots_captured']}")
        
        for subject, subject_data in results['subjects_processed'].items():
            print(f"\n{subject}:")
            print(f"  Incorrect questions: {subject_data['incorrect_questions']}")
            print(f"  Screenshots captured: {subject_data['screenshots_captured']}")
        
        print(f"\nScreenshots saved to: {self.output_dir.absolute()}")

def main():
    """Main function"""
    import sys
    
    extractor = QuestionScreenshotExtractor()
    
    if len(sys.argv) > 1:
        # Command line mode
        if sys.argv[1] == "--batch":
            # Batch mode: extract from all tests
            test_files = extractor.get_test_files()
            test_names = [f.stem for f in test_files]
            for test_name in test_names:
                try:
                    test_file = extractor.find_test_by_name(test_name)
                    results = extractor.process_test_file(test_file)
                    print(f"\nResults for {results['test_name']}:")
                    print(f"Incorrect questions: {results['incorrect_questions_found']}")
                    print(f"Screenshots captured: {results['total_screenshots_captured']}")
                except FileNotFoundError as e:
                    print(f"Skipped: {e}")
        else:
            # Single test mode
            test_name = sys.argv[1]
            try:
                test_file = extractor.find_test_by_name(test_name)
                results = extractor.process_test_file(test_file)
                print(f"\nResults for {results['test_name']}:")
                print(f"Incorrect questions: {results['incorrect_questions_found']}")
                print(f"Screenshots captured: {results['total_screenshots_captured']}")
            except FileNotFoundError as e:
                print(f"Error: {e}")
    else:
        # Interactive mode
        extractor.run_interactive()

if __name__ == "__main__":
    main()
