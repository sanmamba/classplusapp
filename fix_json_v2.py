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
        
        # The issue is that the question field contains unescaped newlines
        # We need to properly escape the JSON string
        
        # Find the question field and fix it
        # Pattern to find the question field content
        pattern = r'"question":\s*"([^"]*(?:\\.[^"]*)*)"'
        
        def fix_question_field(match):
            question_content = match.group(1)
            # Escape newlines and other control characters in the question content
            fixed_content = question_content.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            # Escape quotes
            fixed_content = fixed_content.replace('"', '\\"')
            return f'"question": "{fixed_content}"'
        
        # Apply the fix
        fixed_content = re.sub(pattern, fix_question_field, content, flags=re.DOTALL)
        
        # Try to parse
        data = json.loads(fixed_content)
        
        # Write fixed JSON with proper formatting
        with open('trial_fixed.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print("Successfully fixed trial.json -> trial_fixed.json")
        return True
        
    except Exception as e:
        print(f"Error fixing JSON: {e}")
        # Try a simpler approach - just fix the immediate issue
        try:
            with open('trial.json', 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Simple fix: replace the problematic newline sequence
            content = content.replace('\r\n\r\n', '\\r\\n\\r\\n')
            content = content.replace('\n', '\\n')
            
            data = json.loads(content)
            
            with open('trial_fixed.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print("Fixed with simple approach")
            return True
        except Exception as e2:
            print(f"Simple fix also failed: {e2}")
            return False

if __name__ == "__main__":
    fix_trial_json()
