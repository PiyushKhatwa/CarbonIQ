"""
CarbonIQ Final Project Report Generator (Academic QA & Automatic TOC Edition)
Generates publication-quality Word (.docx) report adhering strictly to university specifications:
- Times New Roman, 12 pt body, 1.5 line spacing, justified alignment, 1-inch margins
- Built-in Word styles for Heading 1, Heading 2, Heading 3
- Native Automatic Word Table of Contents field code
- Multi-section layout: Cover (no page num), Preliminary (Roman i, ii, iii...), Chapters (Arabic 1, 2, 3...)
- All 10 high-resolution figures embedded with captions
- Shaded code listings, customized data tables, and complete Harvard citations
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.section import WD_SECTION
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
    """Add dynamic page numbering to a footer using valid OpenXML run structure."""
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r_label = p.add_run('Page ')
    r_label.font.name = 'Times New Roman'
    r_label.font.size = Pt(10)
    r_label.font.color.rgb = COLOR_MUTED

    r_page = p.add_run()
    r_page.font.name = 'Times New Roman'
    r_page.font.size = Pt(10)
    r_page.font.color.rgb = COLOR_MUTED

    fldChar1 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>')
    instrText = parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> PAGE </w:instrText>')
    fldChar2 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>')
    fldChar3 = parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>')

    r_page._r.append(fldChar1)
    r_page._r.append(instrText)
    r_page._r.append(fldChar2)
    r_page._r.append(fldChar3)

def create_docx_report(target_docx_path=DOCX_PATH):
    print(f"Initializing CarbonIQ DOCX generation -> {target_docx_path}...")
    doc = docx.Document()

    # -------------------------------------------------------------
    # CONFIGURE STYLES ACCORDING TO ACADEMIC SPECIFICATIONS
    # -------------------------------------------------------------
    # Normal Body Text
    style_normal = doc.styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Times New Roman'
    font_normal.size = Pt(12)
    font_normal.color.rgb = COLOR_CHARCOAL
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    style_normal.paragraph_format.space_after = Pt(6)

    # Heading 1 (Chapter Titles)
    style_h1 = doc.styles['Heading 1']
    font_h1 = style_h1.font
    font_h1.name = 'Times New Roman'
    font_h1.size = Pt(16)
    font_h1.bold = True
    font_h1.color.rgb = COLOR_PRIMARY
    style_h1.paragraph_format.space_before = Pt(18)
    style_h1.paragraph_format.space_after = Pt(8)
    style_h1.paragraph_format.keep_with_next = True
    style_h1.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Heading 2 (Main Sections e.g., 1.1)
    style_h2 = doc.styles['Heading 2']
    font_h2 = style_h2.font
    font_h2.name = 'Times New Roman'
    font_h2.size = Pt(13)
    font_h2.bold = True
    font_h2.color.rgb = COLOR_SECONDARY
    style_h2.paragraph_format.space_before = Pt(14)
    style_h2.paragraph_format.space_after = Pt(4)
    style_h2.paragraph_format.keep_with_next = True
    style_h2.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Heading 3 (Subsections e.g., 3.1.1)
    style_h3 = doc.styles['Heading 3']
    font_h3 = style_h3.font
    font_h3.name = 'Times New Roman'
    font_h3.size = Pt(12)
    font_h3.bold = True
    font_h3.color.rgb = COLOR_PRIMARY
    style_h3.paragraph_format.space_before = Pt(10)
    style_h3.paragraph_format.space_after = Pt(3)
    style_h3.paragraph_format.keep_with_next = True
    style_h3.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT

    # -------------------------------------------------------------
    # SECTION 1: COVER PAGE (No headers/footers)
    # -------------------------------------------------------------
    sec1 = doc.sections[0]
    sec1.top_margin = Inches(1.0)
    sec1.bottom_margin = Inches(1.0)
    sec1.left_margin = Inches(1.0)
    sec1.right_margin = Inches(1.0)
    sec1.different_first_page_header_footer = True

    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(40)

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

    # -------------------------------------------------------------
    # SECTION 2: PRELIMINARY PAGES (Lower Roman Page Numbering: i, ii, iii...)
    # -------------------------------------------------------------
    sec2 = doc.add_section(WD_SECTION.NEW_PAGE)
    sec2.top_margin = Inches(1.0)
    sec2.bottom_margin = Inches(1.0)
    sec2.left_margin = Inches(1.0)
    sec2.right_margin = Inches(1.0)
    sec2.header.is_linked_to_previous = False
    sec2.footer.is_linked_to_previous = False
    sectPr2 = sec2._sectPr
    sectPr2.append(parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="lowerRoman" w:start="1"/>'))
    add_page_number_to_footer(sec2.footer)

    # ABSTRACT
    p_abs_title = doc.add_paragraph()
    p_abs_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
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
        p_abs.paragraph_format.space_after = Pt(6)
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

    # TABLE OF CONTENTS (Automatic Word Field Code + Formatted Heading)
    doc.add_page_break()
    p_toc_title = doc.add_paragraph()
    p_toc_title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r_toc_t = p_toc_title.add_run("TABLE OF CONTENTS")
    r_toc_t.font.name = 'Times New Roman'
    r_toc_t.font.size = Pt(16)
    r_toc_t.font.bold = True
    r_toc_t.font.color.rgb = COLOR_PRIMARY
    p_toc_title.paragraph_format.space_after = Pt(14)

    # Insert Native Automatic Word Table of Contents field code
    p_toc_field = doc.add_paragraph()
    p_toc_field.paragraph_format.line_spacing = 1.15
    p_toc_field.paragraph_format.space_after = Pt(12)
    r_toc_begin = p_toc_field.add_run()
    r_toc_begin._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>'))
    r_toc_instr = p_toc_field.add_run()
    r_toc_instr._r.append(parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText>'))
    r_toc_sep = p_toc_field.add_run()
    r_toc_sep._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>'))
    r_toc_txt = p_toc_field.add_run("[Automatic Table of Contents: Right-click and choose 'Update Field' to refresh]")
    r_toc_txt.font.name = 'Times New Roman'
    r_toc_txt.font.italic = True
    r_toc_txt.font.size = Pt(10.5)
    r_toc_txt.font.color.rgb = COLOR_MUTED
    r_toc_end = p_toc_field.add_run()
    r_toc_end._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>'))

    # LIST OF TABLES & LIST OF FIGURES
    doc.add_page_break()
    p_lot = doc.add_paragraph()
    r_lot = p_lot.add_run("LIST OF TABLES")
    r_lot.font.name = 'Times New Roman'
    r_lot.font.size = Pt(16)
    r_lot.font.bold = True
    r_lot.font.color.rgb = COLOR_PRIMARY
    p_lot.paragraph_format.space_after = Pt(10)

    # Insert Native Automatic Word List of Tables field code
    p_lot_field = doc.add_paragraph()
    p_lot_field.paragraph_format.line_spacing = 1.15
    p_lot_field.paragraph_format.space_after = Pt(8)
    r_lot_begin = p_lot_field.add_run()
    r_lot_begin._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>'))
    r_lot_instr = p_lot_field.add_run()
    r_lot_instr._r.append(parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> TOC \\h \\z \\c "Table" </w:instrText>'))
    r_lot_sep = p_lot_field.add_run()
    r_lot_sep._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>'))
    r_lot_end = p_lot_field.add_run()
    r_lot_end._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>'))

    tables_meta = [
        ("Table 2.1", "Comparative Analysis of Existing Carbon Accounting Solutions versus CarbonIQ", "8"),
        ("Table 4.1", "Directory of Verified Backend REST API Endpoints", "29"),
        ("Table 4.2", "CarbonIQ Comprehensive Automated Test Suite Verification Results", "35"),
        ("Table 5.1", "Project Objectives Achievement and Verification Matrix", "38")
    ]
    for num, cap, pg in tables_meta:
        p_row = doc.add_paragraph()
        p_row.paragraph_format.line_spacing = 1.15
        p_row.paragraph_format.space_after = Pt(4)
        r1 = p_row.add_run(f"{num}: {cap}")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        p_row.add_run(" " + "." * max(5, 75 - len(num) - len(cap)) + " ")
        r2 = p_row.add_run(pg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.font.bold = True

    p_lof = doc.add_paragraph()
    p_lof.paragraph_format.space_before = Pt(20)
    r_lof = p_lof.add_run("LIST OF FIGURES")
    r_lof.font.name = 'Times New Roman'
    r_lof.font.size = Pt(16)
    r_lof.font.bold = True
    r_lof.font.color.rgb = COLOR_PRIMARY
    p_lof.paragraph_format.space_after = Pt(10)

    # Insert Native Automatic Word List of Figures field code
    p_lof_field = doc.add_paragraph()
    p_lof_field.paragraph_format.line_spacing = 1.15
    p_lof_field.paragraph_format.space_after = Pt(8)
    r_lof_begin = p_lof_field.add_run()
    r_lof_begin._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="begin"/>'))
    r_lof_instr = p_lof_field.add_run()
    r_lof_instr._r.append(parse_xml(f'<w:instrText {nsdecls("w")} xml:space="preserve"> TOC \\h \\z \\c "Figure" </w:instrText>'))
    r_lof_sep = p_lof_field.add_run()
    r_lof_sep._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="separate"/>'))
    r_lof_end = p_lof_field.add_run()
    r_lof_end._r.append(parse_xml(f'<w:fldChar {nsdecls("w")} w:fldCharType="end"/>'))

    figures_meta = [
        ("Figure 3.1", "CarbonIQ Four-Tier Decoupled System Architecture", "10"),
        ("Figure 3.2", "CarbonIQ Data Flow Diagram (DFD Level 1)", "13"),
        ("Figure 3.3", "CarbonIQ Relational Entity Relationship Diagram (Crow's Foot 3NF)", "14"),
        ("Figure 3.4", "Activity Logging & Deterministic Emission Calculation Workflow", "19"),
        ("Figure 3.5", "Privacy-Preserving AI Advisory & Offline Fallback Workflow", "21"),
        ("Figure 4.1", "CarbonIQ Public Landing Page & Quick-Fill Authentication", "29"),
        ("Figure 4.2", "Executive Carbon Footprint Overview Dashboard", "30"),
        ("Figure 4.3", "Add Activity Modal Wizard with Real-Time Calculation Preview", "31"),
        ("Figure 4.4", "Emissions Analytics, Departmental Breakdown & CSV Export", "32"),
        ("Figure 4.5", "Carbon Reduction Goals Tracking & AI Insights Advisory", "32")
    ]
    for num, cap, pg in figures_meta:
        p_row = doc.add_paragraph()
        p_row.paragraph_format.line_spacing = 1.15
        p_row.paragraph_format.space_after = Pt(4)
        r1 = p_row.add_run(f"{num}: {cap}")
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(11)
        p_row.add_run(" " + "." * max(5, 75 - len(num) - len(cap)) + " ")
        r2 = p_row.add_run(pg)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(11)
        r2.font.bold = True

    # -------------------------------------------------------------
    # SECTION 3: MAIN BODY (Decimal Page Numbering: 1, 2, 3...)
    # -------------------------------------------------------------
    sec3 = doc.add_section(WD_SECTION.NEW_PAGE)
    sec3.top_margin = Inches(1.0)
    sec3.bottom_margin = Inches(1.0)
    sec3.left_margin = Inches(1.0)
    sec3.right_margin = Inches(1.0)
    sec3.header.is_linked_to_previous = False
    sec3.footer.is_linked_to_previous = False
    sectPr3 = sec3._sectPr
    sectPr3.append(parse_xml(f'<w:pgNumType {nsdecls("w")} w:fmt="decimal" w:start="1"/>'))
    add_page_number_to_footer(sec3.footer)

    # TABLE RENDERER
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

        # Caption
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(6)
        p_cap.paragraph_format.space_after = Pt(14)
        run_cap = p_cap.add_run(f"{table_data['number']}: {table_data['caption']}")
        run_cap.font.name = 'Times New Roman'
        run_cap.font.size = Pt(10)
        run_cap.font.bold = True
        run_cap.font.color.rgb = COLOR_MUTED

    # CODE BLOCK RENDERER
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

    # FIGURE RENDERER
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
    p_ch1 = doc.add_paragraph(style='Heading 1')
    p_ch1.text = CHAPTER_1_CONTENT['title']

    for sec in CHAPTER_1_CONTENT['sections']:
        p_sec = doc.add_paragraph(style='Heading 2')
        p_sec.text = sec['heading']

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.text = para

    # -------------------------------------------------------------
    # CHAPTER 2: LITERATURE REVIEW
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch2 = doc.add_paragraph(style='Heading 1')
    p_ch2.text = CHAPTER_2_CONTENT['title']

    for sec in CHAPTER_2_CONTENT['sections']:
        p_sec = doc.add_paragraph(style='Heading 2')
        p_sec.text = sec['heading']

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.text = para

        if 'table' in sec:
            render_table(sec['table'])

    # -------------------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN AND METHODOLOGY
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch3 = doc.add_paragraph(style='Heading 1')
    p_ch3.text = CHAPTER_3_CONTENT['title']

    for sec in CHAPTER_3_CONTENT['sections']:
        p_sec = doc.add_paragraph(style='Heading 2')
        p_sec.text = sec['heading']

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.text = para

        if 'subsections' in sec:
            for sub in sec['subsections']:
                p_sub = doc.add_paragraph(style='Heading 3')
                p_sub.text = sub['subheading']

                for p_text in sub['text'].split('\n\n'):
                    p_body = doc.add_paragraph()
                    p_body.text = p_text

                if 'figure' in sub:
                    render_figure(sub['figure'])

    # -------------------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch4 = doc.add_paragraph(style='Heading 1')
    p_ch4.text = CHAPTER_4_CONTENT['title']

    for sec in CHAPTER_4_CONTENT['sections']:
        p_sec = doc.add_paragraph(style='Heading 2')
        p_sec.text = sec['heading']

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.text = para

        if 'code_snippets' in sec:
            for snippet in sec['code_snippets']:
                render_code_block(snippet['title'], snippet['code'])

        if 'table' in sec:
            render_table(sec['table'])

        if 'ui_walkthrough' in sec:
            for item in sec['ui_walkthrough']:
                p_item = doc.add_paragraph(style='Heading 3')
                p_item.text = item['title']

                for p_text in item['text'].split('\n\n'):
                    p_body = doc.add_paragraph()
                    p_body.text = p_text

                if 'figure' in item:
                    render_figure(item['figure'])

        if 'adbms_sql_demonstrations' in sec:
            p_sql_hdr = doc.add_paragraph(style='Heading 3')
            p_sql_hdr.text = "4.2.6 Comprehensive Advanced DBMS SQL Demonstrations"

            for demo in sec['adbms_sql_demonstrations']:
                render_code_block(demo['title'], demo['sql'])
                p_exp = doc.add_paragraph()
                p_exp.paragraph_format.space_after = Pt(8)
                r_exp = p_exp.add_run(f"Technical Analysis: {demo['explanation']}")
                r_exp.font.name = 'Times New Roman'
                r_exp.font.italic = True
                r_exp.font.size = Pt(11)

        if 'testing_summary' in sec:
            p_test_hdr = doc.add_paragraph(style='Heading 3')
            p_test_hdr.text = "4.2.7 Comprehensive Testing & Verification Results"
            render_table(sec['testing_summary'])

    # -------------------------------------------------------------
    # CHAPTER 5: CONCLUSION AND FUTURE SCOPE
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ch5 = doc.add_paragraph(style='Heading 1')
    p_ch5.text = CHAPTER_5_CONTENT['title']

    for sec in CHAPTER_5_CONTENT['sections']:
        p_sec = doc.add_paragraph(style='Heading 2')
        p_sec.text = sec['heading']

        for para in sec['body'].split('\n\n'):
            p_body = doc.add_paragraph()
            p_body.text = para

        if 'table' in sec:
            render_table(sec['table'])

    # -------------------------------------------------------------
    # REFERENCES (Harvard Style)
    # -------------------------------------------------------------
    doc.add_page_break()
    p_ref = doc.add_paragraph(style='Heading 1')
    p_ref.text = "REFERENCES"

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

    doc.save(target_docx_path)
    print(f"[OK] Successfully built DOCX report at: {target_docx_path}")

if __name__ == '__main__':
    create_docx_report()
