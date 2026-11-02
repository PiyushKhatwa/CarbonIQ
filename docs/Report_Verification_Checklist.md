# CarbonIQ Academic Project Report Verification & Evaluation Rubrics Checklist

**Project Title:** CarbonIQ – AI-Powered Carbon Emissions Footprint Tracker  
**Course & Project Type:** Academic Mini-Project – Advanced Database Management Systems (ADBMS)  
**Institution:** School of Computer Science Engineering and Technology, Bennett University, Greater Noida  
**Academic Year:** Academic Year: [To be confirmed by Department, e.g., 2025–2026] | **Execution Date:** November 2026  
**Faculty Supervisor:** Faculty Supervisor: [To be assigned / confirmed by Department]  

**Student Authors:**
1. **Piyush Khatwa** (University Roll Number: `E23CSEU0853`)
2. **Shobhit Tiwari** (University Roll Number: `E23CSEU0891`)

---

## 1. Compliance with Prescribed University Report Format (`Project Report format.pdf`)

| Report Format Requirement | Prescribed Specification | Implemented Status | Verification Evidence / Location |
|---|---|---|---|
| **Cover Page** | Title, Student Names, Roll Numbers, School, University, Supervisor, Academic Year | **COMPLIANT** ✔ | Verified on Cover Page of `.docx` with explicit department confirmation tag for academic year |
| **Abstract** | 150–300 words covering problem, motivation, objectives, methods, results | **COMPLIANT** ✔ | 272 words, accurately detailing Scope 1, Scope 2, Scope 3 Cat 5, PostgreSQL 18.6, and 54/54 test results |
| **Keywords** | 4–6 relevant keywords | **COMPLIANT** ✔ | Exactly 5 verified keywords: *Carbon Accounting, Advanced Database Systems, PostgreSQL, Deterministic Calculations, Multi-Tenant Architecture* |
| **Chapter 1: Introduction** | Sections 1.1 through 1.6 strictly followed | **COMPLIANT** ✔ | 1.1 Background (precise GHG scopes), 1.2 Problem Statement, 1.3 Aim & Objectives, 1.4 Scope, 1.5 Motivation, 1.6 Organisation |
| **Chapter 2: Literature Review** | Sections 2.1 through 2.4, comparative table, research gaps | **COMPLIANT** ✔ | 2.1 Intro, 2.2 Existing Systems, 2.3 Table 2.1 (7 comparison dimensions), 2.4 Summary & Gap Identification |
| **Chapter 3: System Design & Methodology** | Architecture, DFD, ER, Normalization, ACID, Constraints, Triggers | **COMPLIANT** ✔ | Sections 3.1.1 to 3.1.12; Figures 3.1–3.5; 1NF–3NF mathematical proofs; 13 tables; domain CHECK constraints; defense-in-depth scoping (no RLS) |
| **Chapter 4: Implementation** | Code snippets, API directory, UI walkthroughs, SQL demos, test results | **COMPLIANT** ✔ | 6 Listings; Table 4.1 (19 APIs); Figures 4.1–4.5 (clearly labeled illustrative UI schematics); EXPLAIN ANALYZE; Concurrency test; Table 4.2 |
| **Chapter 5: Conclusion & Future Scope** | Summary, Objectives Achieved, Limitations, Future Enhancements | **COMPLIANT** ✔ | 5.1 Summary, 5.2 Table 5.1 (Objectives Matrix), 5.3 Limitations (Scope boundaries & manual entry), 5.4 Future Enhancements |
| **References** | Harvard Referencing Style; genuine citations with official URLs | **COMPLIANT** ✔ | 14 genuine citations with verified official URLs and access dates (CEA, DEFRA, GHG Protocol, IPCC, EPA, PostgreSQL 18 docs) |
| **Font & Body Typography** | Times New Roman, 12 pt body; Headings larger and bold | **COMPLIANT** ✔ | Configured across all document styles in `.docx` (Heading 1: 18 pt bold, Heading 2: 14 pt bold, Heading 3: 12 pt bold) |
| **Line Spacing & Alignment** | 1.5 line spacing; Justified paragraph alignment | **COMPLIANT** ✔ | Applied to all body paragraphs via OpenXML styling |
| **Margins** | 1.0 inch (72 pt / 1440 dxa) on all four margins | **COMPLIANT** ✔ | Configured across all document sections in `.docx` |
| **Figure & Table Numbering** | Numbered by chapter (e.g., Table 2.1, Figure 3.1) with captions | **COMPLIANT** ✔ | 4 Tables (Table 2.1, 4.1, 4.2, 5.1) and 10 Figures (Fig 3.1–3.5, 4.1–4.5) |
| **Navigation & Lists** | Native automatic TOC, clean dot-leader List of Tables & Figures | **COMPLIANT** ✔ | Automatic Word TOC (`TOC \o "1-3" \h \z \u`); zero "No table of figures entries found" errors; right-aligned tab stops at 9360 dxa with dot leaders |

---

## 2. Technical and Academic Corrections Audit Log

### 1. Multi-Tenant Security & Workspace Scoping
- **Correction Applied:** Clarified that the database-level CHECK constraint `chk_activity_workspace_scope` enforces **domain structural ownership exclusivity** (guaranteeing an activity row cannot have conflicting personal and organizational ownership or be orphaned), **not** dynamic read-access filtering.
- **Defense-in-Depth Model:** Explicitly documented that multi-tenant read-access isolation is handled dynamically at the application tier via Express JWT middleware (`resolveWorkspaceScope`) and parameterized SQL queries (`WHERE organization_id = $1` or `WHERE user_id = $1 AND organization_id IS NULL`).
- **PostgreSQL RLS:** Explicitly noted that PostgreSQL Row-Level Security (RLS) is **not** configured in this implementation, and explained the engineering rationale (clean connection pool reuse, transparent query execution plans, and zero hidden planner overhead).

### 2. GHG Protocol Operational Scope Classification
- **Correction Applied:** Fixed operational boundaries across the Abstract, Chapter 1 (Sections 1.1 & 1.4), Chapter 3 (Section 3.1.11), and Chapter 5 (Section 5.3):
  - **Scope 1 (Direct Emissions):** Stationary fuel combustion (diesel generators, natural gas), LPG appliances, and mobile combustion in company-owned or controlled vehicle fleets.
  - **Scope 2 (Indirect Energy Emissions):** Purchased grid electricity consumed within facilities (calculated via location-based CEA emission factors).
  - **Scope 3 Category 5 (Waste Generated in Operations):** Clarified that municipal solid waste sent to off-site landfills or municipal treatment facilities is formally categorized under Scope 3 Category 5, not Scope 1 or 2.
  - **Transport Classification:** Clarified that vehicle emissions depend on vehicle ownership/control (Scope 1 for company-owned/controlled fleets; Scope 3 Category 7 for employee commuting / Category 6 for business travel).

### 3. Word Document Navigation & List of Tables / Figures
- **Correction Applied:** Removed the raw `<w:instrText> TOC \h \z \c "Table" </w:instrText>` and `<w:instrText> TOC \h \z \c "Figure" </w:instrText>` field codes that previously caused Microsoft Word's `$doc.Fields.Update()` to display `"No table of figures entries found."`.
- **Publication-Grade Formatting:** Replaced with clean, native tab-stopped dot-leader entries aligned to 9360 dxa (6.5 inches) with exact verified page numbers:
  - Tables: Table 2.1 (p. 8), Table 4.1 (p. 29), Table 4.2 (p. 35), Table 5.1 (p. 38).
  - Figures: Figure 3.1 (p. 10), Figure 3.2 (p. 13), Figure 3.3 (p. 14), Figure 3.4 (p. 19), Figure 3.5 (p. 21), Figure 4.1 (p. 29), Figure 4.2 (p. 30), Figure 4.3 (p. 31), Figure 4.4 (p. 32), Figure 4.5 (p. 32).
- **Automated Verification:** Added an automated check in the build pipeline asserting that `"No table of figures entries found"` does not appear in the generated document.

### 4. Honest UI Representation (Chapter 4)
- **Correction Applied:** In the Chapter 4 introduction, Sections 4.2.1 through 4.2.5, and Figure captions, all UI diagrams (Figures 4.1–4.5) are explicitly and honestly described as **illustrative architectural UI schematics / mockups representing the implemented React components and responsive layouts**, rather than actual photographic browser screen captures.

### 5. Database Technical Accuracy & Transaction Rollbacks
- **Stored Routines:** Confirmed and documented that `sp_record_activity_with_emissions` is a PostgreSQL stored function created with `CREATE OR REPLACE FUNCTION ... RETURNS ... LANGUAGE plpgsql`.
- **Transaction Rollback Boundaries:** Clarified that PL/pgSQL stored functions execute within the caller's active transaction context; transaction atomicity and rollbacks are orchestrated by the surrounding transaction block (`BEGIN` ... `COMMIT` / `ROLLBACK`).
- **Object Counts Verified:** Exactly 13 tables, 4 views, 5 custom PL/pgSQL stored functions, 10 active triggers, and 31 B-tree indexes.

### 6. Harvard References with Official URLs
- **Correction Applied:** Updated all bibliographic references in `REFERENCES_LIST` with genuine, working governmental and organizational URLs and access dates (`Accessed: 2 November 2026`).

---

## 3. Student Action & Review Items Prior to Final Submission

1. **Academic Year Confirmation:**
   - *Action:* Confirm with your course instructor / department whether the academic year should read `2025–2026` or `2026–2027`. Currently flagged on the cover page as: `Academic Year: [To be confirmed by Department, e.g., 2025–2026] | November 2026`.
2. **Faculty Supervisor Details:**
   - *Action:* Fill in your assigned project supervisor's name and designation under `Faculty Supervisor: [To be assigned / confirmed by Department]` on the cover page.
3. **Institutional Signatures:**
   - *Action:* Print the Declaration and Certificate pages (or export to PDF) for signing by both students (Piyush Khatwa and Shobhit Tiwari) and the project guide.
4. **Primary File Deliverable:**
   - *File:* Submit `docs/CarbonIQ_Final_Submission.docx` (synchronized with `docs/CarbonIQ_Final_Project_Report.docx`). Both files have been verified via Microsoft Word 16.0 COM automation with 0 errors.

