#!/usr/bin/env python3
"""
Script to fix JSON control characters in trial.json
"""

import json
import re

def fix_trial_json():
    """Fix the trial.json file"""
    try:
        # Read the file as raw text
        with open('trial.json', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # The main issue is that the JSON has unescaped newlines in string values
        # We need to find the question field and fix it
        
        # Simple approach: replace common problematic patterns
        # Fix literal newlines in strings
        content = re.sub(r'(?<!\\)\r?\n', r'\\n', content)
        content = re.sub(r'(?<!\\)\r', r'\\r', content)
        content = re.sub(r'(?<!\\)\t', r'\\t', content)
        
        # Fix unescaped quotes in HTML content
        # This is more complex, but let's try a basic fix
        content = re.sub(r'(?<!\\)"', r'\\"', content)
        
        # Try to parse
        data = json.loads(content)
        
        # Write fixed JSON with proper formatting
        with open('trial_fixed.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("Successfully fixed trial.json -> trial_fixed.json")
        return True
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Error at line {e.lineno}, column {e.colno}")
        return False
    except Exception as e:
        print(f"General error: {e}")
        return False

if __name__ == "__main__":
    fix_trial_json()
