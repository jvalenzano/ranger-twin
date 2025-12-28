# PDF Extraction

## Description
Extracts structured content from regulatory PDF documents including text, tables, and section headers. Designed for parsing Forest Service Handbooks (FSH), Forest Service Manuals (FSM), and CFR documents. Supports targeted extraction by section number, page range, or content pattern.

## Triggers
When should the agent invoke this skill?
- User uploads or references a PDF document for analysis
- Query requests specific sections from regulatory documents
- Need to extract tables from FSH/FSM documents (e.g., "extract Table 10-1")
- Request for text from specific pages or sections
- User asks to "read" or "extract" content from a PDF file
- Cross-referencing regulatory requirements from PDF sources

## Instructions
Step-by-step reasoning for the agent:
1. **Validate Input**: Verify the PDF path exists and is readable
   - Check file exists at specified path
   - Verify it's a valid PDF file
   - Note file size and page count
2. **Determine Extraction Mode**: Based on user request
   - Full document: Extract all text (use for small documents)
   - By section: Extract specific FSH/FSM section (e.g., "Section 10.3")
   - By page: Extract specific page range
   - Tables only: Extract and format tabular data
3. **Extract Content**: Apply appropriate extraction method
   - Text extraction preserves section structure
   - Table extraction identifies and formats tables as markdown
   - Section extraction uses regex patterns for FSH/FSM formats
4. **Post-Process**: Clean and structure output
   - Remove excessive whitespace
   - Preserve paragraph structure
   - Format tables as markdown
   - Add page number citations
5. **Return Results**: Provide extracted content with metadata

## Inputs
| Input | Type | Required | Description |
|-------|------|----------|-------------|
| file_path | string | Yes | Path to PDF file (absolute or relative to agent) |
| extraction_mode | string | No | Mode: "full", "section", "pages", "tables" (default: "full") |
| section_number | string | No | FSH/FSM section to extract (e.g., "10.3", "Chapter 30") |
| start_page | integer | No | Starting page for page-based extraction (1-indexed) |
| end_page | integer | No | Ending page for page-based extraction (inclusive) |
| search_pattern | string | No | Regex pattern to find specific content |

## Outputs
| Output | Type | Description |
|--------|------|-------------|
| success | boolean | Whether extraction succeeded |
| file_name | string | Name of the processed PDF file |
| page_count | integer | Total pages in the document |
| extracted_text | string | The extracted content (markdown formatted) |
| tables | array | List of extracted tables (if applicable) |
| sections_found | array | Section headers discovered in document |
| citations | array | Page/section references for extracted content |
| error | string | Error message if extraction failed |

## Reasoning Chain
Step-by-step reasoning for the agent:
1. First, validate the PDF file exists and is accessible
2. Then, determine the extraction scope based on user request
3. Next, apply the appropriate extraction method (full, section, pages, tables)
4. Then, clean and format the extracted content as markdown
5. Finally, return results with page citations for traceability

## Resources
- `resources/fsh-section-patterns.json` - Regex patterns for FSH section headers
- `resources/fsm-section-patterns.json` - Regex patterns for FSM section headers

## Scripts
- `scripts/extract_pdf.py` - Python implementation of PDF extraction
  - Functions:
    - `extract_full_text(file_path: str) -> dict` - Extract all text from PDF
    - `extract_section(file_path: str, section: str) -> dict` - Extract specific section
    - `extract_pages(file_path: str, start: int, end: int) -> dict` - Extract page range
    - `extract_tables(file_path: str) -> dict` - Extract all tables as markdown
    - `execute(inputs: dict) -> dict` - Main entry point

## Examples

### Example 1: Full Document Extraction
**Input:**
```json
{
  "file_path": "/path/to/FSH-1909.15-Chapter10.pdf",
  "extraction_mode": "full"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "FSH-1909.15-Chapter10.pdf",
  "page_count": 45,
  "extracted_text": "# FSH 1909.15 - Chapter 10\n\n## 10.1 Authority\n\nThe National Environmental Policy Act...",
  "tables": [],
  "sections_found": ["10.1 Authority", "10.2 Objective", "10.3 Policy"],
  "citations": [
    {"content": "Chapter 10 header", "page": 1},
    {"content": "Section 10.1", "page": 1}
  ],
  "error": null
}
```

### Example 2: Section-Specific Extraction
**Input:**
```json
{
  "file_path": "/path/to/FSH-1909.15-Chapter30.pdf",
  "extraction_mode": "section",
  "section_number": "31.2"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "FSH-1909.15-Chapter30.pdf",
  "page_count": 120,
  "extracted_text": "## 31.2 Categorical Exclusions Established by the Chief\n\nThe following categories of action...",
  "tables": [],
  "sections_found": ["31.2"],
  "citations": [
    {"content": "Section 31.2", "page": 42, "source": "FSH 1909.15"}
  ],
  "error": null
}
```

### Example 3: Table Extraction
**Input:**
```json
{
  "file_path": "/path/to/FSH-2409.18-Chapter40.pdf",
  "extraction_mode": "tables"
}
```

**Output:**
```json
{
  "success": true,
  "file_name": "FSH-2409.18-Chapter40.pdf",
  "page_count": 85,
  "extracted_text": "",
  "tables": [
    {
      "page": 12,
      "caption": "Table 40-1: Cruise Method Selection",
      "markdown": "| Method | Use Case | Accuracy |\n|--------|----------|----------|\n| 100% | High-value timber | ±5% |\n| Variable Plot | Mixed stands | ±10% |"
    }
  ],
  "sections_found": [],
  "citations": [
    {"content": "Table 40-1", "page": 12}
  ],
  "error": null
}
```

## References
- Forest Service Handbook 1909.15 - NEPA Handbook
- Forest Service Manual 1950 - Environmental Policy and Procedures
- 36 CFR Part 220 - Forest Service NEPA Procedures
- PyMuPDF Documentation: https://pymupdf.readthedocs.io/
- pdfplumber Documentation: https://github.com/jsvine/pdfplumber
