import json
import os
from pathlib import Path

def extract_test_marks(test_file_path):
    """Extract marks information from a test JSON file."""
    try:
        with open(test_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        test_info = data.get('data', {})
        test_name = test_info.get('test', {}).get('name', 'Unknown Test')
        section_stats = test_info.get('sectionWiseStats', [])
        
        # Group sections by subject (Physics, Chemistry, Mathematics)
        subject_marks = {
            'Physics': {'scored': 0, 'total': 0},
            'Chemistry': {'scored': 0, 'total': 0},
            'Mathematics': {'scored': 0, 'total': 0}
        }
        
        for section in section_stats:
            section_name = section.get('name', '').lower()
            marks_scored = section.get('marksScored', 0)
            marks_total = section.get('sectionMarks', 0)
            
            if 'physics' in section_name:
                subject_marks['Physics']['scored'] += marks_scored
                subject_marks['Physics']['total'] += marks_total
            elif 'chemistry' in section_name or 'chem' in section_name:
                subject_marks['Chemistry']['scored'] += marks_scored
                subject_marks['Chemistry']['total'] += marks_total
            elif 'maths' in section_name or 'math' in section_name:
                subject_marks['Mathematics']['scored'] += marks_scored
                subject_marks['Mathematics']['total'] += marks_total
        
        # Calculate total marks
        total_scored = sum(subject['scored'] for subject in subject_marks.values())
        total_possible = sum(subject['total'] for subject in subject_marks.values())
        
        return {
            'test_name': test_name,
            'file_name': test_file_path.stem,
            'physics': subject_marks['Physics'],
            'chemistry': subject_marks['Chemistry'],
            'mathematics': subject_marks['Mathematics'],
            'total_scored': total_scored,
            'total_possible': total_possible
        }
    
    except Exception as e:
        print(f"Error processing {test_file_path}: {e}")
        return None

def main():
    """Main function to process all test files and display marks."""
    tests_dir = Path('tests')
    
    if not tests_dir.exists():
        print("Tests directory not found!")
        return
    
    # Get all JSON files in tests directory
    test_files = list(tests_dir.glob('*.json'))
    
    if not test_files:
        print("No test files found!")
        return
    
    # Display each test individually
    for test_file in sorted(test_files):
        test_data = extract_test_marks(test_file)
        if test_data:
            print(f"\n{'='*60}")
            print(f"TEST: {test_data['file_name']}")
            print(f"{'='*60}")
            
            print(f"Physics: {test_data['physics']['scored']}/{test_data['physics']['total']}")
            print(f"Chemistry: {test_data['chemistry']['scored']}/{test_data['chemistry']['total']}")
            print(f"Mathematics: {test_data['mathematics']['scored']}/{test_data['mathematics']['total']}")
            print(f"Total: {test_data['total_scored']}/{test_data['total_possible']}")
            
            print()  # Add blank line between tests

if __name__ == "__main__":
    main()
