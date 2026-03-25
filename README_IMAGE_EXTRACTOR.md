# Test Image Extractor

A Python script to extract images from JSON test files for questions where `Correct = False` and organize them by subject (Physics, Chemistry, Maths).

## Features

- Extracts images from incorrectly answered questions in test JSON files
- Organizes images by subject (Physics, Chemistry, Maths)
- Downloads images from URLs found in HTML content
- Supports both interactive and command-line modes
- Batch processing capability
- Automatic duplicate removal
- Rate limiting to avoid overwhelming servers

## Installation

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Interactive Mode (Recommended)

Run the script without arguments to use the interactive mode:

```bash
python extract_incorrect_images.py
```

The script will:
1. Show all available test files
2. Ask you to enter a test name (partial matching supported)
3. Ask for output directory (optional)
4. Process the test and show results

### Command Line Mode

#### Single Test Extraction
```bash
python extract_incorrect_images.py "Advp1_15_02_2026"
```

#### Batch Processing (All Tests)
```bash
python extract_incorrect_images.py --batch
```

### Programmatic Usage

```python
from extract_incorrect_images import TestImageExtractor

# Create extractor instance
extractor = TestImageExtractor(
    tests_dir="tests",
    output_dir="extracted_images"
)

# Process a single test
test_file = extractor.find_test_by_name("Advp1_15_02_2026")
results = extractor.process_test_file(test_file)

# Process multiple tests
test_names = ["Advp1_15_02_2026", "Advp1_18_03_2026"]
extractor.run_batch(test_names)
```

## Output Structure

The script creates the following directory structure:

```
extracted_images/
├── Physics/
│   ├── Q1_Image1.png
│   ├── Q1_Image2.png
│   ├── Q3_Image1.png
│   └── ...
├── Chemistry/
│   ├── Q2_Image1.png
│   └── ...
└── Maths/
    ├── Q4_Image1.png
    └── ...
```

- Images are named as `Q{question_number}_Image{image_number}`
- Subject folders are created automatically
- Only images from incorrectly answered questions are extracted
- Duplicates are removed automatically

## Test File Format

The script expects JSON files with the following structure:

```json
{
  "data": {
    "test": {
      "name": "Test Name"
    },
    "sections": [
      {
        "name": "Physics_MCQ",
        "questions": [
          {
            "name": "Question text with <img src='url'>",
            "isCorrect": false,
            "isAttempted": true,
            "options": [
              {
                "name": "Option text with <img src='url'>",
                "isCorrect": true
              }
            ]
          }
        ]
      }
    ]
  }
}
```

## What Gets Extracted

The script extracts images from questions that meet these criteria:
- `isCorrect: false` (incorrect answers)
- `isAttempted: true` (attempted questions)
- Includes partially correct answers (`isPartiallyCorrect: true`)

Images are extracted from:
- Question text (`name` field)
- All option text (`options[].name` field)

## Example Usage Script

Run the example script for guided usage:

```bash
python example_usage.py
```

## Error Handling

- Network errors are caught and logged
- Invalid URLs are skipped
- Missing files are reported
- Rate limiting prevents server overload

## Notes

- The script automatically detects subjects from section names
- Supported subjects: Physics, Chemistry, Maths
- Images are downloaded with appropriate file extensions
- The script includes a 0.5-second delay between downloads to be respectful to servers

## Troubleshooting

### "Test file not found"
- Check that the test name matches part of the filename
- Use partial matching (e.g., "Advp1" instead of full name)

### "No images downloaded"
- Verify the test contains incorrectly answered questions
- Check that questions contain image URLs in HTML format
- Ensure network connectivity

### "Permission denied"
- Make sure the output directory is writable
- Run with appropriate permissions

## Requirements

- Python 3.6+
- requests library
- pathlib (included in Python 3.4+)
- Internet connection for downloading images
