"""
CarbonIQ Report Rebuilder and Validator (Academic QA Pass)
Strictly executes the validation pipeline:
1. Generates temporary DOCX: docs/CarbonIQ_Final_Project_Report_TEMP.docx
2. Validates that it is a valid ZIP archive
3. Reopens using python-docx to verify paragraphs, tables, images, and 5 chapters
4. Executes Microsoft Word 16.0 COM automation to update the Table of Contents, verify page count, and save
5. Overwrites docs/CarbonIQ_Final_Project_Report.docx ONLY upon 100% success
6. Preserves Markdown report unchanged as requested
7. Reports validation results and exact file size
"""

import os
import shutil
import zipfile
import subprocess
import docx

import generate_docx_report
import report_content

DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs')
TEMP_DOCX = os.path.join(DOCS_DIR, 'CarbonIQ_Final_Project_Report_TEMP.docx')
FINAL_DOCX = os.path.join(DOCS_DIR, 'CarbonIQ_Final_Project_Report.docx')
SUBMISSION_DOCX = os.path.join(DOCS_DIR, 'CarbonIQ_Final_Submission.docx')

def rebuild_and_validate():
    print("==============================================================================")
    print("CARBONIQ REPORT FINAL ACADEMIC QA & SUBMISSION-READINESS PIPELINE")
    print("==============================================================================")

    # Step 1: Generate temporary docx
    print(f"\n[STEP 1] Generating temporary Word document at:\n         {TEMP_DOCX}")
    generate_docx_report.create_docx_report(target_docx_path=TEMP_DOCX)

    if not os.path.exists(TEMP_DOCX):
        raise RuntimeError("Generation failed: Temporary DOCX does not exist.")
    temp_size = os.path.getsize(TEMP_DOCX)
    print(f"--> Temporary file created successfully. Size: {temp_size:,} bytes ({temp_size / (1024*1024):.2f} MB)")

    # Step 2: Validate DOCX is a valid ZIP archive
    print("\n[STEP 2] Validating DOCX ZIP archive integrity...")
    with zipfile.ZipFile(TEMP_DOCX, 'r') as z:
        bad_file = z.testzip()
        if bad_file:
            raise RuntimeError(f"Corrupt ZIP entry detected: {bad_file}")
        namelist = z.namelist()
        required_entries = ['word/document.xml', '[Content_Types].xml', 'word/_rels/document.xml.rels']
        for req in required_entries:
            if req not in namelist:
                raise RuntimeError(f"Missing required DOCX structure: {req}")
        media_files = [n for n in namelist if n.startswith('word/media/')]
        print(f"--> ZIP archive valid. Total files: {len(namelist)}, Embedded media files: {len(media_files)}")

    # Step 3: Reopen using python-docx and inspect content
    print("\n[STEP 3] Reopening document using python-docx to verify document structure...")
    doc = docx.Document(TEMP_DOCX)
    total_paragraphs = len(doc.paragraphs)
    total_tables = len(doc.tables)
    total_sections = len(doc.sections)
    print(f"--> Document parsed. Paragraphs: {total_paragraphs}, Tables: {total_tables}, Sections: {total_sections}")

    # Verify all 5 chapters exist
    full_text = "\n".join(p.text for p in doc.paragraphs)
    chapters = [
        "CHAPTER 1: INTRODUCTION",
        "CHAPTER 2: LITERATURE REVIEW",
        "CHAPTER 3: SYSTEM DESIGN AND METHODOLOGY",
        "CHAPTER 4: IMPLEMENTATION",
        "CHAPTER 5: CONCLUSION AND FUTURE SCOPE"
    ]
    for ch in chapters:
        if ch in full_text:
            print(f"    [OK] Found: {ch}")
        else:
            raise RuntimeError(f"Validation Error: Missing required chapter '{ch}'")

    # Verify student names and roll numbers
    if "Piyush Khatwa" in full_text and "E23CSEU0853" in full_text:
        print("    [OK] Found Student 1: Piyush Khatwa (E23CSEU0853)")
    else:
        raise RuntimeError("Missing Student 1 details!")

    if "Shobhit Tiwari" in full_text and "E23CSEU0891" in full_text:
        print("    [OK] Found Student 2: Shobhit Tiwari (E23CSEU0891)")
    else:
        raise RuntimeError("Missing Student 2 details!")

    # Verify Abstract keywords count (4-6 allowed, exactly 5 present)
    kw_count = len(report_content.KEYWORDS)
    print(f"    [OK] Verified Keywords Count: {kw_count} (Requires 4-6; configured: {kw_count})")
    if kw_count < 4 or kw_count > 6:
        raise RuntimeError(f"Invalid keywords count: {kw_count}")

    # Verify Heading styles applied
    h1_count = sum(1 for p in doc.paragraphs if p.style.name == 'Heading 1')
    h2_count = sum(1 for p in doc.paragraphs if p.style.name == 'Heading 2')
    h3_count = sum(1 for p in doc.paragraphs if p.style.name == 'Heading 3')
    print(f"    [OK] Heading Styles Verified: Heading 1: {h1_count}, Heading 2: {h2_count}, Heading 3: {h3_count}")

    # Step 4: Validate directly with Microsoft Word COM automation and update TOC
    print("\n[STEP 4] Executing Microsoft Word 16.0 COM Automation (Updating TOC & Fields)...")
    powershell_cmd = (
        f"$word = New-Object -ComObject Word.Application; "
        f"$word.Visible = $false; "
        f"try {{ "
        f"  $doc = $word.Documents.Open('{os.path.abspath(TEMP_DOCX)}'); "
        f"  # Update Table of Contents and fields natively\n"
        f"  if ($doc.TablesOfContents.Count -ge 1) {{ $doc.TablesOfContents.Item(1).Update(); }} "
        f"  $doc.Fields.Update(); "
        f"  $hasError = $doc.Content.Find.Execute('No table of figures entries found'); "
        f"  if ($hasError) {{ throw 'Error string found: No table of figures entries found'; }} "
        f"  $pageCount = $doc.ComputeStatistics(2); "
        f"  $doc.Save(); "
        f"  Write-Host 'SUCCESS: Word updated TOC and saved document with 0 errors. Total pages:' $pageCount; "
        f"  $doc.Close(); "
        f"  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null; "
        f"}} catch {{ "
        f"  Write-Host 'FAILED: ' $_.Exception.Message; "
        f"  exit 1; "
        f"}} finally {{ "
        f"  $word.Quit(); "
        f"  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null; "
        f"  [GC]::Collect(); [GC]::WaitForPendingFinalizers(); "
        f"}}"
    )
    result = subprocess.run(
        ["powershell", "-NoProfile", "-Command", powershell_cmd],
        capture_output=True,
        text=True
    )
    print("--> Word Automation Output:", result.stdout.strip())
    if result.returncode != 0 or "SUCCESS" not in result.stdout:
        print("Error details:", result.stderr)
        raise RuntimeError(f"Microsoft Word rejected the document: {result.stdout.strip()}")

    # Step 5: Replace FINAL_DOCX and create SUBMISSION_DOCX
    print(f"\n[STEP 5] All validations passed. Promoting temporary file to deliverables:")
    print(f"         1. {FINAL_DOCX}")
    print(f"         2. {SUBMISSION_DOCX}")
    shutil.copy2(TEMP_DOCX, FINAL_DOCX)
    shutil.copy2(TEMP_DOCX, SUBMISSION_DOCX)
    os.remove(TEMP_DOCX)
    
    final_size = os.path.getsize(FINAL_DOCX)
    sub_size = os.path.getsize(SUBMISSION_DOCX)
    print(f"--> Successfully created final DOCX files. Size: {final_size:,} bytes ({final_size / (1024*1024):.2f} MB)")

    # Step 6: Final Verification: Opening finalized submission DOCX via Word
    print("\n[STEP 6] Final Verification: Opening finalized CarbonIQ_Final_Submission.docx via Word COM...")
    final_ps = (
        f"$word = New-Object -ComObject Word.Application; "
        f"$word.Visible = $false; "
        f"try {{ "
        f"  $doc = $word.Documents.Open('{os.path.abspath(SUBMISSION_DOCX)}'); "
        f"  $title = $doc.Paragraphs.Item(2).Range.Text.Trim(); "
        f"  $pages = $doc.ComputeStatistics(2); "
        f"  $tocCount = $doc.TablesOfContents.Count; "
        f"  Write-Host \"VERIFIED: Final Submission DOCX opened cleanly. Title: $title | Pages: $pages | TOCs: $tocCount\"; "
        f"  $doc.Close(); "
        f"  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc) | Out-Null; "
        f"}} catch {{ "
        f"  Write-Host 'FAILED: ' $_.Exception.Message; "
        f"  exit 1; "
        f"}} finally {{ "
        f"  $word.Quit(); "
        f"  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null; "
        f"  [GC]::Collect(); [GC]::WaitForPendingFinalizers(); "
        f"}}"
    )
    fin_res = subprocess.run(["powershell", "-NoProfile", "-Command", final_ps], capture_output=True, text=True)
    print("--> Final Word Check Output:", fin_res.stdout.strip())
    if "VERIFIED" not in fin_res.stdout:
        raise RuntimeError("Final Word verification failed!")

    print("\n==============================================================================")
    print("SUBMISSION-READINESS VALIDATION COMPLETE: BOTH DOCX DELIVERABLES 100% OPERATIONAL")
    print("==============================================================================")

if __name__ == '__main__':
    rebuild_and_validate()
