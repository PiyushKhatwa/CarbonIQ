"""
CarbonIQ Final Project Report Generator
Builds both docs/CarbonIQ_Final_Project_Report.docx and docs/CarbonIQ_Final_Project_Report.md
strictly following the prescribed university report format and ADBMS rubrics.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

from report_content import (
    STUDENT_DETAILS,
    ABSTRACT_TEXT,
    KEYWORDS,
    CHAPTER_1_CONTENT,
    CHAPTER_2_CONTENT,
    CHAPTER_3_CONTENT,
    CHAPTER_4_CONTENT,
    CHAPTER_5_CONTENT,
    REFERENCES_LIST,
)

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs')
os.makedirs(DOCS_DIR, exist_ok=True)
DOCX_PATH = os.path.join(DOCS_DIR, 'CarbonIQ_Final_Project_Report.docx')
MD_PATH = os.path.join(DOCS_DIR, 'CarbonIQ_Final_Project_Report.md')
FIGURES_DIR = os.path.join(DOCS_DIR, 'figures')

# Color palette
COLOR_PRIMARY = RGBColor(0x17, 0x6B, 0x4D)      # Forest Green
COLOR_SECONDARY = RGBColor(0x10, 0x4B, 0x38)    # Deep Forest
COLOR_CHARCOAL = RGBColor(0x18, 0x23, 0x1E)     # Main Body Charcoal
COLOR_MUTED = RGBColor(0x4B, 0x55, 0x63)        # Gray

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Set inner cell padding in twips."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, color_hex):
    """Set background color of a table cell."""
    shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
    cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

def add_page_number_to_footer(footer):
    """Add dynamic page numbering to a footer."""
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = p.add_run('Page ')
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    run.font.color.rgb = COLOR_MUTED

    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')

    p._p.append(fldChar1)
    p._p.append(instrText)
    p._p.append(fldChar2)
    p._p.append(fldChar3)

def create_docx_report():
    print("Initializing CarbonIQ DOCX generation...")
    doc = docx.Document()

    # 1. Page Setup: 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        add_page_number_to_footer(section.footer)

    # Configure Default Styles
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = COLOR_CHARCOAL

    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(36)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_title = p_title.add_run("CarbonIQ\nAI-Powered Carbon Emissions Footprint Tracker")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    run_title.font.color.rgb = COLOR_PRIMARY
    p_title.paragraph_format.space_after = Pt(24)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_sub = p_sub.add_run("ACADEMIC MINI-PROJECT REPORT\nADVANCED DATABASE MANAGEMENT SYSTEMS (ADBMS)")
    run_sub.font.name = 'Times New Roman'
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = COLOR_SECONDARY
    p_sub.paragraph_format.space_after = Pt(48)

    p_submitted = doc.add_paragraph()
    p_submitted.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_subby = p_submitted.add_run("Submitted By:\n")
    run_subby.font.name = 'Times New Roman'
    run_subby.font.size = Pt(12)
    run_subby.font.bold = True

    for s in STUDENT_DETAILS['students']:
        r_name = p_submitted.add_run(f"{s['name']}\nRoll Number: {s['roll_number']}\n\n")
        r_name.font.name = 'Times New Roman'
        r_name.font.size = Pt(12)

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(48)
    run_inst = p_inst.add_run(
        "School of Computer Science Engineering and Technology\n"
        "Bennett University, Greater Noida\n"
        f"Academic Year: {STUDENT_DETAILS['academic_year']} | {STUDENT_DETAILS['submission_date']}"
    )
    run_inst.font.name = 'Times New Roman'
    run_inst.font.size = Pt(12)
    run_inst.font.bold = True
    run_inst.font.color.rgb = COLOR_SECONDARY

    doc.add_page_break()

    # -------------------------------------------------------------
    # PRELIMINARY: ABSTRACT
    # -------------------------------------------------------------
    p_abs_title = doc.add_paragraph()
    run_abs_title = p_abs_title.add_run("ABSTRACT")
    run_abs_title.font.name = 'Times New Roman'
    run_abs_title.font.size = Pt(16)
    run_abs_title.font.bold = True
    run_abs_title.font.color.rgb = COLOR_PRIMARY
    p_abs_title.paragraph_format.space_after = Pt(12)

    for para in ABSTRACT_TEXT.split('\n\n'):
        p_abs = doc.add_paragraph()
        p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_abs.paragraph_format.line_spacing = 1.5
        p_abs.paragraph_format.space_after = Pt(8)
        run_p = p_abs.add_run(para)
        run_p.font.name = 'Times New Roman'
        run_p.font.size = Pt(12)

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_before = Pt(12)
    p_kw.paragraph_format.space_after = Pt(24)
    run_kw_label = p_kw.add_run("Keywords: ")
    run_kw_label.font.name = 'Times New Roman'
    run_kw_label.font.bold = True
    run_kw_label.font.size = Pt(11)
    run_kw_val = p_kw.add_run(", ".join(KEYWORDS))
    run_kw_val.font.name = 'Times New Roman'
    run_kw_val.font.italic = True
    run_kw_val.font.size = Pt(11)

    # -------------------------------------------------------------
    # PRELIMINARY: TABLE OF CONTENTS (Static Formatted)
    # -------------------------------------------------------------
    doc.add_page_break()
    p_toc_title = doc.add_paragraph()
    r_toc_t = p_toc_title.add_run("TABLE OF CONTENTS")
    r_toc_t.font.name = 'Times New Roman'
    r_toc_t.font.size = Pt(16)
    r_toc_t.font.bold = True
    r_toc_t.font.color.rgb = COLOR_PRIMARY
    p_toc_title.paragraph_format.space_after = Pt(14)

    toc_entries = [
        ("ABSTRACT", "ii"),
        ("LIST OF TABLES", "iv"),
        ("LIST OF FIGURES", "v"),
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Background of the Project", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 Aim and Objectives", "3"),
        ("  1.4 Scope of the Project", "4"),
        ("  1.5 Motivation and Significance", "5"),
        ("  1.6 Organisation of the Report", "6"),
        ("CHAPTER 2: LITERATURE REVIEW", "7"),
        ("  2.1 Introduction", "7"),
        ("  2.2 Review of Existing Systems and Research", "7"),
        ("  2.3 Comparison of Existing Approaches", "9"),
        ("  2.4 Summary", "10"),
        ("CHAPTER 3: SYSTEM DESIGN AND METHODOLOGY", "11"),
        ("  3.1 Proposed Methodology", "11"),
        ("    3.1.1 Overall System Architecture", "11"),
        ("    3.1.2 User Roles and Workspace Management", "12"),
        ("    3.1.3 Functional and Non-Functional Requirements", "13"),
        ("    3.1.4 System Workflow and Data Flow Architecture", "14"),
        ("    3.1.5 Entity Relationship (ER) Modelling", "15"),
        ("    3.1.6 Relational Normalization Proof (1NF to 3NF)", "17"),
        ("    3.1.7 Relational Schema, Constraints and Referential Integrity", "18"),
        ("    3.1.8 Advanced Database Objects: Views, Procedures and Triggers", "19"),
        ("    3.1.9 B-Tree Indexing Strategy & Query Optimization Design", "20"),
        ("    3.1.10 ACID Transaction Management and Concurrency Control", "21"),
        ("    3.1.11 Emission Calculation Methodology & Mathematical Formulas", "22"),
        ("    3.1.12 AI Advisory Architecture and Offline Heuristic Fallback", "23"),
        ("CHAPTER 4: IMPLEMENTATION", "25"),
        ("  4.1 Algorithms and Core Code Snippets", "25"),
        ("  4.2 Database and API Integration", "29"),
        ("    4.2.1 Landing Page & Authentication Workflow", "31"),
        ("    4.2.2 Executive Carbon Dashboard", "32"),
        ("    4.2.3 Real-Time Activity Wizard with Live Preview", "33"),
        ("    4.2.4 Emissions Analytics & CSV Report Export", "34"),
        ("    4.2.5 Carbon Reduction Goals & AI Insights Advisory", "35"),
        ("    4.2.6 Comprehensive ADBMS SQL Demonstrations", "36"),
        ("    4.2.7 Comprehensive Testing & Verification Results", "38"),
        ("  4.3 Implementation Challenges and Technical Solutions", "39"),
        ("CHAPTER 5: CONCLUSION AND FUTURE SCOPE", "41"),
        ("  5.1 Summary of the Work", "41"),
        ("  5.2 Objectives Achieved", "41"),
        ("  5.3 Limitations", "43"),
        ("  5.4 Future Enhancements", "44"),
        ("REFERENCES", "45")
    ]

    for title, pg in toc_entries:
        p_row = doc.add_paragraph()
        p_row.paragraph_format.line_spacing = 1.15
        p_row.paragraph_format.space_after = Pt(3)
        r_title = p_row.add_run(title)
        r_title.font.name = 'Times New Roman'
        r_title.font.size = Pt(11)
        if title.startswith("CHAPTER") or title in ["ABSTRACT", "REFERENCES", "LIST OF TABLES", "LIST OF FIGURES"]:
            r_title.font.bold = True
            r_title.font.color.rgb = COLOR_SECONDARY

        # Dot leader
        p_row.add_run(" " + "." * (85 - len(title) * 2) + " ")
        r_pg = p_row.add_run(pg)
        r_pg.font.name = 'Times New Roman'
        r_pg.font.size = Pt(11)
        r_pg.font.bold = True

    # -------------------------------------------------------------
    # PRELIMINARY: LIST OF TABLES & LIST OF FIGURES
    # -------------------------------------------------------------
    doc.add_page_break()
    p_lot = doc.add_paragraph()
    r_lot = p_lot.add_run("LIST OF TABLES")
    r_lot.font.name = 'Times New Roman'
    r_lot.font.size = Pt(16)
    r_lot.font.bold = True
    r_lot.font.color.rgb = COLOR_PRIMARY
    p_lot.paragraph_format.space_after = Pt(14)

    tables_meta = [
        ("Table 2.1", "Comparative Analysis of Existing Carbon Accounting Solutions versus CarbonIQ", "9"),
        ("Table 4.1", "Directory of Verified Backend REST API Endpoints", "30"),
        ("Table 4.2", "CarbonIQ Comprehensive Automated Test Suite Verification Results", "38"),
        ("Table 5.1", "Project Objectives Achievement and Verification Matrix", "42")
    ]
    for num, cap, pg in tables_meta:
        p_row = doc.add_paragraph()
        p_row.paragraph_format.line_spacing = 1.15
        p_row.paragraph_format.space_after = Pt(4)
        r1 = p_row.add_run(f"{num}: {cap}")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        p_row.add_run(" " + "." * (75 - len(num) - len(cap)) + " ")
        r2 = p_row.add_run(pg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.font.bold = True

    p_lof = doc.add_paragraph()
    p_lof.paragraph_format.space_before = Pt(24)
    r_lof = p_lof.add_run("LIST OF FIGURES")
    r_lof.font.name = 'Times New Roman'
    r_lof.font.size = Pt(16)
    r_lof.font.bold = True
    r_lof.font.color.rgb = COLOR_PRIMARY
    p_lof.paragraph_format.space_after = Pt(14)

    figures_meta = [
        ("Figure 3.1", "CarbonIQ Four-Tier Decoupled System Architecture", "11"),
        ("Figure 3.2", "CarbonIQ Data Flow Diagram (DFD Level 1)", "14"),
        ("Figure 3.3", "CarbonIQ Relational Entity Relationship Diagram (Crow's Foot 3NF)", "16"),
        ("Figure 3.4", "Activity Logging & Deterministic Emission Calculation Workflow", "21"),
        ("Figure 3.5", "Privacy-Preserving AI Advisory & Offline Fallback Workflow", "24"),
        ("Figure 4.1", "CarbonIQ Public Landing Page & Quick-Fill Authentication", "31"),
        ("Figure 4.2", "Executive Carbon Footprint Overview Dashboard", "32"),
        ("Figure 4.3", "Add Activity Modal Wizard with Real-Time Calculation Preview", "33"),
        ("Figure 4.4", "Emissions Analytics, Departmental Breakdown & CSV Export", "34"),
        ("Figure 4.5", "Carbon Reduction Goals Tracking & AI Insights Advisory", "35")
    ]
    for num, cap, pg in figures_meta:
        p_row = doc.add_paragraph()
        p_row.paragraph_format.line_spacing = 1.15
        p_row.paragraph_format.space_after = Pt(4)
        r1 = p_row.add_run(f"{num}: {cap}")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        p_row.add_run(" " + "." * (75 - len(num) - len(cap)) + " ")
        r2 = p_row.add_run(pg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.font.bold = True

    # -------------------------------------------------------------
    # HELPER TO RENDER A TABLE IN DOCX
    # -------------------------------------------------------------
    def render_table(table_data):
        headers = table_data['headers']
        rows = table_data['rows']
        num_cols = len(headers)
        t = doc.add_table(rows=len(rows) + 1, cols=num_cols)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False

        # Header Row
        hdr_cells = t.rows[0].cells
        for col_idx, text in enumerate(headers):
            cell = hdr_cells[col_idx]
            cell.text = text
            set_cell_background(cell, "176B4D")
            set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.runs[0]
            run.font.name = 'Times New Roman'
            run.font.size = Pt(10)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

        # Data Rows
        for row_idx, row_data in enumerate(rows):
            row_cells = t.rows[row_idx + 1].cells
            bg_color = "F4F9F6" if row_idx % 2 == 1 else "FFFFFF"
            for col_idx, cell_value in enumerate(row_data):
                cell = row_cells[col_idx]
                cell.text = str(cell_value)
                set_cell_background(cell, bg_color)
                set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.line_spacing = 1.15
                if len(p.runs) > 0:
                    run = p.runs[0]
                    run.font.name = 'Times New Roman'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = COLOR_CHARCOAL

        # Add caption below table
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(6)
        p_cap.paragraph_format.space_after = Pt(14)
        run_cap = p_cap.add_run(f"{table_data['number']}: {table_data['caption']}")
        run_cap.font.name = 'Times New Roman'
        run_cap.font.size = Pt(10)
        run_cap.font.bold = True
        run_cap.font.color.rgb = COLOR_MUTED

    # HELPER TO RENDER A CODE BLOCK IN DOCX
    def render_code_block(title, code):
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(10)
        p_t.paragraph_format.space_after = Pt(4)
        r_t = p_t.add_run(title)
        r_t.font.name = 'Times New Roman'
        r_t.font.size = Pt(10.5)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_SECONDARY

        t = doc.add_table(rows=1, cols=1)
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = t.rows[0].cells[0]
        set_cell_background(cell, "F8FAFC")
        set_cell_margins(cell, top=100, bottom=100, left=150, right=150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.1
        r = p.add_run(code)
        r.font.name = 'Consolas'
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_after = Pt(8)

    # HELPER TO INSERT FIGURE WITH CAPTION
    def render_figure(fig_info):
        path = os.path.join(DOCS_DIR, '..', fig_info['path'])
        if os.path.exists(path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(10)
            p_img.paragraph_format.space_after = Pt(4)
            run = p_img.add_run()
            run.add_picture(path, width=Inches(6.0))

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(14)
            r_cap = p_cap.add_run(f"{fig_info['number']}: {fig_info['caption']}")
            r_cap.font.name = 'Times New Roman'
            r_cap.font.size = Pt(10)
            r_cap.font.bold = True
            r_cap.font.color.rgb = COLOR_MUTED

    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch1 = doc.add_paragraph()
    r_ch1 = p_ch1.add_run(CHAPTER_1_CONTENT['title'])
    r_ch1.font.name = 'Times New Roman'
    r_ch1.font.size = Pt(18)
    r_ch1.font.bold = True
    r_ch1.font.color.rgb = COLOR_PRIMARY
    p_ch1.paragraph_format.space_after = Pt(16)

    for sec in CHAPTER_1_CONTENT['sections']:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)
        r_sec = p_sec.add_run(sec['heading'])
        r_sec.font.name = 'Times New Roman'
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = COLOR_SECONDARY

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.line_spacing = 1.5
            p_body.paragraph_format.space_after = Pt(6)
            r_b = p_body.add_run(para)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)

    # -------------------------------------------------------------
    # CHAPTER 2: LITERATURE REVIEW
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch2 = doc.add_paragraph()
    r_ch2 = p_ch2.add_run(CHAPTER_2_CONTENT['title'])
    r_ch2.font.name = 'Times New Roman'
    r_ch2.font.size = Pt(18)
    r_ch2.font.bold = True
    r_ch2.font.color.rgb = COLOR_PRIMARY
    p_ch2.paragraph_format.space_after = Pt(16)

    for sec in CHAPTER_2_CONTENT['sections']:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)
        r_sec = p_sec.add_run(sec['heading'])
        r_sec.font.name = 'Times New Roman'
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = COLOR_SECONDARY

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.line_spacing = 1.5
            p_body.paragraph_format.space_after = Pt(6)
            r_b = p_body.add_run(para)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)

        if 'table' in sec:
            render_table(sec['table'])

    # -------------------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN AND METHODOLOGY
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch3 = doc.add_paragraph()
    r_ch3 = p_ch3.add_run(CHAPTER_3_CONTENT['title'])
    r_ch3.font.name = 'Times New Roman'
    r_ch3.font.size = Pt(18)
    r_ch3.font.bold = True
    r_ch3.font.color.rgb = COLOR_PRIMARY
    p_ch3.paragraph_format.space_after = Pt(16)

    for sec in CHAPTER_3_CONTENT['sections']:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)
        r_sec = p_sec.add_run(sec['heading'])
        r_sec.font.name = 'Times New Roman'
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = COLOR_SECONDARY

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.line_spacing = 1.5
            p_body.paragraph_format.space_after = Pt(6)
            r_b = p_body.add_run(para)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)

        if 'subsections' in sec:
            for sub in sec['subsections']:
                p_sub = doc.add_paragraph()
                p_sub.paragraph_format.space_before = Pt(10)
                p_sub.paragraph_format.space_after = Pt(4)
                r_sub = p_sub.add_run(sub['subheading'])
                r_sub.font.name = 'Times New Roman'
                r_sub.font.size = Pt(13)
                r_sub.font.bold = True
                r_sub.font.color.rgb = COLOR_PRIMARY

                for p_text in sub['text'].split('\n\n'):
                    p_body = doc.add_paragraph()
                    p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                    p_body.paragraph_format.line_spacing = 1.5
                    p_body.paragraph_format.space_after = Pt(6)
                    r_b = p_body.add_run(p_text)
                    r_b.font.name = 'Times New Roman'
                    r_b.font.size = Pt(12)

                if 'figure' in sub:
                    render_figure(sub['figure'])

    # -------------------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch4 = doc.add_paragraph()
    r_ch4 = p_ch4.add_run(CHAPTER_4_CONTENT['title'])
    r_ch4.font.name = 'Times New Roman'
    r_ch4.font.size = Pt(18)
    r_ch4.font.bold = True
    r_ch4.font.color.rgb = COLOR_PRIMARY
    p_ch4.paragraph_format.space_after = Pt(16)

    for sec in CHAPTER_4_CONTENT['sections']:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)
        r_sec = p_sec.add_run(sec['heading'])
        r_sec.font.name = 'Times New Roman'
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = COLOR_SECONDARY

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.line_spacing = 1.5
            p_body.paragraph_format.space_after = Pt(6)
            r_b = p_body.add_run(para)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)

        if 'code_snippets' in sec:
            for snippet in sec['code_snippets']:
                render_code_block(snippet['title'], snippet['code'])

        if 'table' in sec:
            render_table(sec['table'])

        if 'ui_walkthrough' in sec:
            for item in sec['ui_walkthrough']:
                p_item = doc.add_paragraph()
                p_item.paragraph_format.space_before = Pt(8)
                p_item.paragraph_format.space_after = Pt(4)
                r_it = p_item.add_run(item['title'])
                r_it.font.name = 'Times New Roman'
                r_it.font.size = Pt(13)
                r_it.font.bold = True
                r_it.font.color.rgb = COLOR_PRIMARY

                for p_text in item['text'].split('\n\n'):
                    p_body = doc.add_paragraph()
                    p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
                    p_body.paragraph_format.line_spacing = 1.5
                    p_body.paragraph_format.space_after = Pt(6)
                    r_b = p_body.add_run(p_text)
                    r_b.font.name = 'Times New Roman'
                    r_b.font.size = Pt(12)

                if 'figure' in item:
                    render_figure(item['figure'])

        if 'adbms_sql_demonstrations' in sec:
            p_sql_hdr = doc.add_paragraph()
            p_sql_hdr.paragraph_format.space_before = Pt(12)
            p_sql_hdr.paragraph_format.space_after = Pt(6)
            r_sql_hdr = p_sql_hdr.add_run("4.2.6 Comprehensive Advanced DBMS SQL Demonstrations")
            r_sql_hdr.font.name = 'Times New Roman'
            r_sql_hdr.font.size = Pt(13)
            r_sql_hdr.font.bold = True
            r_sql_hdr.font.color.rgb = COLOR_PRIMARY

            for demo in sec['adbms_sql_demonstrations']:
                render_code_block(demo['title'], demo['sql'])
                p_exp = doc.add_paragraph()
                p_exp.paragraph_format.space_after = Pt(8)
                r_exp = p_exp.add_run(f"Technical Analysis: {demo['explanation']}")
                r_exp.font.name = 'Times New Roman'
                r_exp.font.italic = True
                r_exp.font.size = Pt(11)

        if 'testing_summary' in sec:
            p_test_hdr = doc.add_paragraph()
            p_test_hdr.paragraph_format.space_before = Pt(12)
            p_test_hdr.paragraph_format.space_after = Pt(6)
            r_test_hdr = p_test_hdr.add_run("4.2.7 Comprehensive Testing & Verification Results")
            r_test_hdr.font.name = 'Times New Roman'
            r_test_hdr.font.size = Pt(13)
            r_test_hdr.font.bold = True
            r_test_hdr.font.color.rgb = COLOR_PRIMARY

            render_table(sec['testing_summary'])

    # -------------------------------------------------------------
    # CHAPTER 5: CONCLUSION AND FUTURE SCOPE
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch5 = doc.add_paragraph()
    r_ch5 = p_ch5.add_run(CHAPTER_5_CONTENT['title'])
    r_ch5.font.name = 'Times New Roman'
    r_ch5.font.size = Pt(18)
    r_ch5.font.bold = True
    r_ch5.font.color.rgb = COLOR_PRIMARY
    p_ch5.paragraph_format.space_after = Pt(16)

    for sec in CHAPTER_5_CONTENT['sections']:
        p_sec = doc.add_paragraph()
        p_sec.paragraph_format.space_before = Pt(12)
        p_sec.paragraph_format.space_after = Pt(4)
        r_sec = p_sec.add_run(sec['heading'])
        r_sec.font.name = 'Times New Roman'
        r_sec.font.size = Pt(14)
        r_sec.font.bold = True
        r_sec.font.color.rgb = COLOR_SECONDARY

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_body.paragraph_format.line_spacing = 1.5
            p_body.paragraph_format.space_after = Pt(6)
            r_b = p_body.add_run(para)
            r_b.font.name = 'Times New Roman'
            r_b.font.size = Pt(12)

        if 'table' in sec:
            render_table(sec['table'])

    # -------------------------------------------------------------
    # REFERENCES (Harvard Style)
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ref = doc.add_paragraph()
    r_ref = p_ref.add_run("REFERENCES")
    r_ref.font.name = 'Times New Roman'
    r_ref.font.size = Pt(18)
    r_ref.font.bold = True
    r_ref.font.color.rgb = COLOR_PRIMARY
    p_ref.paragraph_format.space_after = Pt(16)

    for ref in REFERENCES_LIST:
        p_entry = doc.add_paragraph()
        p_entry.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_entry.paragraph_format.line_spacing = 1.15
        p_entry.paragraph_format.space_after = Pt(6)
        r_cit = p_entry.add_run(f"{ref['citation']} ")
        r_cit.font.name = 'Times New Roman'
        r_cit.font.bold = True
        r_cit.font.size = Pt(11)
        r_det = p_entry.add_run(ref['details'])
        r_det.font.name = 'Times New Roman'
        r_det.font.size = Pt(11)

    doc.save(DOCX_PATH)
    print(f"[OK] Successfully built DOCX report at: {DOCX_PATH}")

def create_markdown_report():
    print("Generating CarbonIQ Markdown mirror...")
    lines = []
    lines.append(f"# {STUDENT_DETAILS['project_title']}\n")
    lines.append(f"**{STUDENT_DETAILS['project_type']}**  ")
    lines.append(f"**{STUDENT_DETAILS['institution']}**  ")
    lines.append(f"**Academic Year:** {STUDENT_DETAILS['academic_year']} | **Date:** {STUDENT_DETAILS['submission_date']}\n")
    lines.append("### Project Authors:")
    for s in STUDENT_DETAILS['students']:
        lines.append(f"- **{s['name']}** (Roll Number: `{s['roll_number']}`)")
    lines.append("\n---\n")

    lines.append("## ABSTRACT\n")
    lines.append(ABSTRACT_TEXT + "\n")
    lines.append(f"**Keywords:** *{', '.join(KEYWORDS)}*\n")
    lines.append("\n---\n")

    # Helper to convert table to markdown
    def md_table(t_data):
        res = [f"### {t_data['number']}: {t_data['caption']}\n"]
        res.append("| " + " | ".join(t_data['headers']) + " |")
        res.append("| " + " | ".join(["---"] * len(t_data['headers'])) + " |")
        for row in t_data['rows']:
            res.append("| " + " | ".join(str(c).replace("\n", "<br/>") for c in row) + " |")
        res.append("\n")
        return "\n".join(res)

    # Chapter 1
    lines.append(f"## {CHAPTER_1_CONTENT['title']}\n")
    for sec in CHAPTER_1_CONTENT['sections']:
        lines.append(f"### {sec['heading']}\n")
        lines.append(sec['body'] + "\n")

    # Chapter 2
    lines.append(f"## {CHAPTER_2_CONTENT['title']}\n")
    for sec in CHAPTER_2_CONTENT['sections']:
        lines.append(f"### {sec['heading']}\n")
        lines.append(sec['body'] + "\n")
        if 'table' in sec:
            lines.append(md_table(sec['table']))

    # Chapter 3
    lines.append(f"## {CHAPTER_3_CONTENT['title']}\n")
    for sec in CHAPTER_3_CONTENT['sections']:
        lines.append(f"### {sec['heading']}\n")
        lines.append(sec['body'] + "\n")
        if 'subsections' in sec:
            for sub in sec['subsections']:
                lines.append(f"#### {sub['subheading']}\n")
                lines.append(sub['text'] + "\n")
                if 'figure' in sub:
                    lines.append(f"![{sub['figure']['caption']}]({sub['figure']['path']})  ")
                    lines.append(f"*{sub['figure']['number']}: {sub['figure']['caption']}*\n")

    # Chapter 4
    lines.append(f"## {CHAPTER_4_CONTENT['title']}\n")
    for sec in CHAPTER_4_CONTENT['sections']:
        lines.append(f"### {sec['heading']}\n")
        lines.append(sec['body'] + "\n")
        if 'code_snippets' in sec:
            for code_item in sec['code_snippets']:
                lines.append(f"**{code_item['title']}**\n")
                lines.append("```javascript\n" + code_item['code'] + "\n```\n")
        if 'table' in sec:
            lines.append(md_table(sec['table']))
        if 'ui_walkthrough' in sec:
            for ui in sec['ui_walkthrough']:
                lines.append(f"#### {ui['title']}\n")
                lines.append(ui['text'] + "\n")
                if 'figure' in ui:
                    lines.append(f"![{ui['figure']['caption']}]({ui['figure']['path']})  ")
                    lines.append(f"*{ui['figure']['number']}: {ui['figure']['caption']}*\n")
        if 'adbms_sql_demonstrations' in sec:
            lines.append("#### 4.2.6 Comprehensive Advanced DBMS SQL Demonstrations\n")
            for demo in sec['adbms_sql_demonstrations']:
                lines.append(f"**{demo['title']}**\n")
                lines.append("```sql\n" + demo['sql'] + "\n```\n")
                lines.append(f"*Technical Analysis: {demo['explanation']}*\n")
        if 'testing_summary' in sec:
            lines.append("#### 4.2.7 Comprehensive Testing & Verification Results\n")
            lines.append(md_table(sec['testing_summary']))

    # Chapter 5
    lines.append(f"## {CHAPTER_5_CONTENT['title']}\n")
    for sec in CHAPTER_5_CONTENT['sections']:
        lines.append(f"### {sec['heading']}\n")
        lines.append(sec['body'] + "\n")
        if 'table' in sec:
            lines.append(md_table(sec['table']))

    # References
    lines.append("## REFERENCES\n")
    for ref in REFERENCES_LIST:
        lines.append(f"- **{ref['citation']}** {ref['details']}")

    with open(MD_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"[OK] Successfully built Markdown mirror at: {MD_PATH}")

if __name__ == '__main__':
    create_docx_report()
    create_markdown_report()
    print("Report generation pipeline completed successfully!")
