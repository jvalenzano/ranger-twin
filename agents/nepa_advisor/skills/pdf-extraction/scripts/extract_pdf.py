"""
PDF Extraction Script for NEPA Advisor

Extracts text, sections, and tables from regulatory PDF documents
(FSH, FSM, CFR) with citation tracking.

Requires:
    pip install pymupdf pdfplumber
"""

import re
from pathlib import Path
from typing import Any


def _get_pdf_metadata(file_path: str) -> dict[str, Any]:
    """Get basic PDF metadata without full extraction."""
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(file_path)
        metadata = {
            "file_name": Path(file_path).name,
            "page_count": len(doc),
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
        }
        doc.close()
        return metadata
    except Exception as e:
        return {"error": str(e)}


def extract_full_text(file_path: str, max_pages: int = 100) -> dict[str, Any]:
    """
    Extract all text from a PDF document.

    Args:
        file_path: Path to the PDF file
        max_pages: Maximum pages to extract (default 100)

    Returns:
        Dictionary with extracted text and metadata
    """
    try:
        import fitz  # PyMuPDF

        path = Path(file_path)
        if not path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}",
                "extracted_text": "",
            }

        doc = fitz.open(file_path)
        page_count = len(doc)
        pages_to_extract = min(page_count, max_pages)

        extracted_parts = []
        citations = []
        sections_found = []

        # FSH/FSM section patterns
        section_patterns = [
            r"^(\d+(?:\.\d+)*)\s+([A-Z][A-Za-z\s]+)",  # "10.1 Authority"
            r"^(Chapter\s+\d+)",  # "Chapter 10"
            r"^(Section\s+\d+(?:\.\d+)*)",  # "Section 31.2"
            r"^(CHAPTER\s+\d+)",  # "CHAPTER 10"
        ]

        for page_num in range(pages_to_extract):
            page = doc[page_num]
            text = page.get_text("text")

            # Clean up text
            text = re.sub(r'\n{3,}', '\n\n', text)  # Reduce excessive newlines
            text = re.sub(r'[ \t]+', ' ', text)  # Normalize spaces

            # Find sections on this page
            for pattern in section_patterns:
                matches = re.findall(pattern, text, re.MULTILINE)
                for match in matches:
                    section = match if isinstance(match, str) else " ".join(match)
                    if section not in sections_found:
                        sections_found.append(section)
                        citations.append({
                            "content": section,
                            "page": page_num + 1,
                        })

            extracted_parts.append(f"--- Page {page_num + 1} ---\n{text}")

        doc.close()

        return {
            "success": True,
            "file_name": path.name,
            "page_count": page_count,
            "pages_extracted": pages_to_extract,
            "extracted_text": "\n\n".join(extracted_parts),
            "tables": [],
            "sections_found": sections_found,
            "citations": citations,
            "error": None,
        }

    except ImportError:
        return {
            "success": False,
            "error": "PyMuPDF (fitz) not installed. Run: pip install pymupdf",
            "extracted_text": "",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Extraction failed: {str(e)}",
            "extracted_text": "",
        }


def extract_section(file_path: str, section_number: str) -> dict[str, Any]:
    """
    Extract a specific section from an FSH/FSM document.

    Args:
        file_path: Path to the PDF file
        section_number: Section to extract (e.g., "10.3", "31.2", "Chapter 30")

    Returns:
        Dictionary with extracted section text
    """
    try:
        import fitz  # PyMuPDF

        path = Path(file_path)
        if not path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}",
                "extracted_text": "",
            }

        doc = fitz.open(file_path)
        page_count = len(doc)

        # Build search patterns for the section
        section_clean = section_number.strip()
        patterns = [
            rf"^{re.escape(section_clean)}\s",  # "10.3 " at line start
            rf"^Section\s+{re.escape(section_clean)}",  # "Section 10.3"
            rf"^{re.escape(section_clean)}\s*[-–—]\s*",  # "10.3 - Title"
        ]

        # Handle "Chapter X" format
        if section_clean.lower().startswith("chapter"):
            patterns.append(rf"(?i)^{re.escape(section_clean)}")

        found_section = False
        section_text = []
        section_start_page = None
        citations = []

        for page_num in range(page_count):
            page = doc[page_num]
            text = page.get_text("text")

            # Look for section start
            if not found_section:
                for pattern in patterns:
                    match = re.search(pattern, text, re.MULTILINE)
                    if match:
                        found_section = True
                        section_start_page = page_num + 1
                        # Get text from match point
                        section_text.append(text[match.start():])
                        citations.append({
                            "content": f"Section {section_number}",
                            "page": section_start_page,
                            "source": path.name,
                        })
                        break
            else:
                # Check if we've hit the next section (same level or higher)
                next_section = _detect_next_section(text, section_clean)
                if next_section:
                    # Add text up to next section
                    section_text.append(text[:next_section])
                    break
                else:
                    section_text.append(text)

        doc.close()

        if not found_section:
            return {
                "success": False,
                "file_name": path.name,
                "page_count": page_count,
                "error": f"Section '{section_number}' not found in document",
                "extracted_text": "",
                "sections_found": [],
                "citations": [],
            }

        return {
            "success": True,
            "file_name": path.name,
            "page_count": page_count,
            "extracted_text": "\n".join(section_text).strip(),
            "tables": [],
            "sections_found": [section_number],
            "citations": citations,
            "error": None,
        }

    except ImportError:
        return {
            "success": False,
            "error": "PyMuPDF (fitz) not installed. Run: pip install pymupdf",
            "extracted_text": "",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Section extraction failed: {str(e)}",
            "extracted_text": "",
        }


def _detect_next_section(text: str, current_section: str) -> int | None:
    """Detect where the next same-level or higher section starts."""
    # Parse current section level (e.g., "10.3" -> 2 levels)
    parts = current_section.replace("Chapter ", "").split(".")
    current_level = len(parts)

    # Look for next section at same or higher level
    pattern = r"^(\d+(?:\.\d+)*)\s+[A-Z]"
    for match in re.finditer(pattern, text, re.MULTILINE):
        found_section = match.group(1)
        found_level = len(found_section.split("."))
        if found_level <= current_level:
            return match.start()

    return None


def extract_pages(file_path: str, start_page: int, end_page: int) -> dict[str, Any]:
    """
    Extract text from specific page range.

    Args:
        file_path: Path to the PDF file
        start_page: Starting page (1-indexed)
        end_page: Ending page (inclusive)

    Returns:
        Dictionary with extracted text
    """
    try:
        import fitz  # PyMuPDF

        path = Path(file_path)
        if not path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}",
                "extracted_text": "",
            }

        doc = fitz.open(file_path)
        page_count = len(doc)

        # Validate page range
        start_idx = max(0, start_page - 1)
        end_idx = min(page_count, end_page)

        if start_idx >= page_count:
            doc.close()
            return {
                "success": False,
                "error": f"Start page {start_page} exceeds document length ({page_count} pages)",
                "extracted_text": "",
            }

        extracted_parts = []
        citations = []

        for page_num in range(start_idx, end_idx):
            page = doc[page_num]
            text = page.get_text("text")
            text = re.sub(r'\n{3,}', '\n\n', text)
            extracted_parts.append(f"--- Page {page_num + 1} ---\n{text}")
            citations.append({
                "content": f"Page {page_num + 1}",
                "page": page_num + 1,
            })

        doc.close()

        return {
            "success": True,
            "file_name": path.name,
            "page_count": page_count,
            "pages_extracted": end_idx - start_idx,
            "extracted_text": "\n\n".join(extracted_parts),
            "tables": [],
            "sections_found": [],
            "citations": citations,
            "error": None,
        }

    except ImportError:
        return {
            "success": False,
            "error": "PyMuPDF (fitz) not installed. Run: pip install pymupdf",
            "extracted_text": "",
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Page extraction failed: {str(e)}",
            "extracted_text": "",
        }


def extract_tables(file_path: str, max_pages: int = 50) -> dict[str, Any]:
    """
    Extract tables from PDF using pdfplumber.

    Args:
        file_path: Path to the PDF file
        max_pages: Maximum pages to scan for tables

    Returns:
        Dictionary with extracted tables as markdown
    """
    try:
        import pdfplumber

        path = Path(file_path)
        if not path.exists():
            return {
                "success": False,
                "error": f"File not found: {file_path}",
                "tables": [],
            }

        tables_found = []
        citations = []

        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            pages_to_scan = min(page_count, max_pages)

            for page_num in range(pages_to_scan):
                page = pdf.pages[page_num]
                tables = page.extract_tables()

                for table_idx, table in enumerate(tables):
                    if not table or len(table) < 2:
                        continue

                    # Convert to markdown
                    md_table = _table_to_markdown(table)
                    if md_table:
                        table_id = f"Table on page {page_num + 1}"
                        tables_found.append({
                            "page": page_num + 1,
                            "table_index": table_idx,
                            "caption": table_id,
                            "markdown": md_table,
                            "rows": len(table),
                            "cols": len(table[0]) if table else 0,
                        })
                        citations.append({
                            "content": table_id,
                            "page": page_num + 1,
                        })

        return {
            "success": True,
            "file_name": path.name,
            "page_count": page_count,
            "extracted_text": "",
            "tables": tables_found,
            "sections_found": [],
            "citations": citations,
            "error": None,
        }

    except ImportError:
        return {
            "success": False,
            "error": "pdfplumber not installed. Run: pip install pdfplumber",
            "tables": [],
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Table extraction failed: {str(e)}",
            "tables": [],
        }


def _table_to_markdown(table: list[list]) -> str:
    """Convert a table (list of rows) to markdown format."""
    if not table or len(table) < 1:
        return ""

    # Clean cells
    def clean_cell(cell):
        if cell is None:
            return ""
        return str(cell).replace("|", "\\|").replace("\n", " ").strip()

    rows = [[clean_cell(cell) for cell in row] for row in table]

    # Determine column widths
    num_cols = max(len(row) for row in rows)

    # Normalize row lengths
    for row in rows:
        while len(row) < num_cols:
            row.append("")

    # Build markdown
    lines = []

    # Header row
    header = "| " + " | ".join(rows[0]) + " |"
    lines.append(header)

    # Separator
    separator = "|" + "|".join(["---" for _ in range(num_cols)]) + "|"
    lines.append(separator)

    # Data rows
    for row in rows[1:]:
        line = "| " + " | ".join(row) + " |"
        lines.append(line)

    return "\n".join(lines)


def execute(inputs: dict) -> dict[str, Any]:
    """
    Main entry point for PDF extraction skill.

    Args:
        inputs: Dictionary containing:
            - file_path (str): Path to PDF file
            - extraction_mode (str): "full", "section", "pages", or "tables"
            - section_number (str): Section to extract (for "section" mode)
            - start_page (int): Start page (for "pages" mode)
            - end_page (int): End page (for "pages" mode)

    Returns:
        Dictionary with extraction results
    """
    file_path = inputs.get("file_path", "")
    mode = inputs.get("extraction_mode", "full").lower()

    if not file_path:
        return {
            "success": False,
            "error": "No file_path provided",
            "extracted_text": "",
        }

    # Resolve relative paths
    path = Path(file_path)
    if not path.is_absolute():
        # Try relative to agent data directory
        # Path: scripts/ -> pdf-extraction/ -> skills/ -> nepa_advisor/
        agent_dir = Path(__file__).parent.parent.parent.parent
        data_paths = [
            agent_dir / "data" / file_path,
            agent_dir / "data" / "fsh" / file_path,
            agent_dir / "data" / "fsm" / file_path,
            path,
        ]
        for p in data_paths:
            if p.exists():
                file_path = str(p)
                break

    if mode == "full":
        max_pages = inputs.get("max_pages", 100)
        return extract_full_text(file_path, max_pages)

    elif mode == "section":
        section = inputs.get("section_number", "")
        if not section:
            return {
                "success": False,
                "error": "section_number required for section extraction mode",
                "extracted_text": "",
            }
        return extract_section(file_path, section)

    elif mode == "pages":
        start = inputs.get("start_page", 1)
        end = inputs.get("end_page", start)
        return extract_pages(file_path, start, end)

    elif mode == "tables":
        max_pages = inputs.get("max_pages", 50)
        return extract_tables(file_path, max_pages)

    else:
        return {
            "success": False,
            "error": f"Unknown extraction_mode: {mode}. Use 'full', 'section', 'pages', or 'tables'",
            "extracted_text": "",
        }


if __name__ == "__main__":
    # Test with a sample file
    import sys

    if len(sys.argv) > 1:
        test_file = sys.argv[1]
        result = execute({"file_path": test_file, "extraction_mode": "full"})
        print(f"Success: {result.get('success')}")
        print(f"Pages: {result.get('page_count')}")
        print(f"Sections found: {result.get('sections_found', [])}")
        if result.get("error"):
            print(f"Error: {result.get('error')}")
        else:
            print(f"\nFirst 500 chars:\n{result.get('extracted_text', '')[:500]}")
    else:
        print("Usage: python extract_pdf.py <path_to_pdf>")
