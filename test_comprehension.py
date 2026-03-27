#!/usr/bin/env python3
"""
Test script to verify comprehension image extraction
"""

import json
from pathlib import Path

def test_comprehension_extraction():
    """Test comprehension questions are handled correctly"""
    
    # Load a test file with comprehension questions
    test_file = Path('tests/module_5.json')
    
    with open(test_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    test_info = data.get('data', {})
    sections = test_info.get('sections', [])
    
    comprehension_questions = []
    
    for section in sections:
        questions = section.get('questions', [])
        for question in questions:
            if question.get('isComprehension', False):
                comprehension_questions.append({
                    'section': section.get('name', 'Unknown'),
                    'question_id': question.get('_id', 'Unknown'),
                    'has_paragraph': bool(question.get('paragraph', '')),
                    'paragraph_length': len(question.get('paragraph', '')),
                    'question_text_length': len(question.get('name', ''))
                })
    
    print(f"Found {len(comprehension_questions)} comprehension questions:")
    print("-" * 80)
    
    for i, q in enumerate(comprehension_questions[:5], 1):  # Show first 5
        print(f"{i}. Section: {q['section']}")
        print(f"   Question ID: {q['question_id']}")
        print(f"   Has paragraph: {q['has_paragraph']}")
        print(f"   Paragraph length: {q['paragraph_length']} chars")
        print(f"   Question text length: {q['question_text_length']} chars")
        print()
    
    if len(comprehension_questions) > 5:
        print(f"... and {len(comprehension_questions) - 5} more comprehension questions")
    
    return comprehension_questions

if __name__ == "__main__":
    test_comprehension_extraction()
