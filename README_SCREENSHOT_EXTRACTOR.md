# Question Screenshot Extractor

A Python script that captures complete question screenshots (similar to the website's copy function) for questions where `Correct = False` and organizes them by subject.

## Features

- **Complete Question Screenshots**: Captures the entire question including text, options, images, and styling
- **Website-like Rendering**: Uses a headless browser to render questions exactly as they appear on the website
- **Subject Organization**: Automatically organizes screenshots by subject (Physics, Chemistry, Maths)
- **High Quality**: Produces high-resolution PNG screenshots
- **Interactive & Batch Modes**: Supports both interactive and command-line usage

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install Playwright browser binaries:
```bash
python -m playwright install chromium
```

## Usage

### Interactive Mode (Recommended)
```bash
python extract_question_screenshots.py
```

### Command Line Mode
```bash
# Single test
python extract_question_screenshots.py "module_1"

# Batch processing (all tests)
python extract_question_screenshots.py --batch
```

## What Gets Captured

Each screenshot includes:
- Question header (subject and question number)
- Complete question text with all images
- All options with correct/incorrect indicators
- Your selected answer (if incorrect)
- Marks information and time spent
- Professional styling similar to the website

## Output Structure

```
question_screenshots/
├── Physics/
│   ├── Q1_Screenshot.png
│   ├── Q3_Screenshot.png
│   └── ...
├── Chemistry/
│   ├── Q2_Screenshot.png
│   └── ...
└── Maths/
    ├── Q4_Screenshot.png
    └── ...
```

## Comparison with Image Extractor

- **Image Extractor** (`extract_incorrect_images.py`): Downloads individual image files from URLs
- **Screenshot Extractor** (`extract_question_screenshots.py`): Captures complete question as screenshots

Use the screenshot extractor when you want the complete question layout like the website's copy function.

## Requirements

- Python 3.7+
- Playwright with Chromium browser
- Internet connection (for initial browser download)
- Sufficient disk space for screenshots
