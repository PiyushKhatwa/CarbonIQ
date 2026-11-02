# CarbonIQ Academic Project Report Verification & Evaluation Rubrics Checklist

**Project Title:** CarbonIQ – AI-Powered Carbon Emissions Footprint Tracker  
**Course & Project Type:** Academic Mini-Project – Advanced Database Management Systems (ADBMS)  
**Institution:** School of Computer Science Engineering and Technology, Bennett University, Greater Noida  
**Academic Year:** 2025–2026 | **Execution Date:** November 2026  

**Student Authors:**
1. **Piyush Khatwa** (University Roll Number: `E23CSEU0853`)
2. **Shobhit Tiwari** (University Roll Number: `E23CSEU0891`)

---

## 1. Compliance with Prescribed University Report Format (`Project Report format.pdf`)

| Report Format Requirement | Prescribed Specification | Implemented Status | Verification Evidence / Location |
|---|---|---|---|
| **Cover Page** | Title, Student Names, Roll Numbers, School, University | **COMPLIANT** ✔ | Rendered on Cover Page of `.docx` and top of `.md` |
| **Abstract** | 150–300 words covering problem, motivation, objectives, methods, results | **COMPLIANT** ✔ | 268 words, covering full technical stack and empirical outcomes |
| **Keywords** | 4–6 relevant keywords | **COMPLIANT** ✔ | Exactly 5 verified keywords included: *Carbon Footprint Tracking, Advanced Database Management Systems, PostgreSQL 18, ACID Transactions, Artificial Intelligence Advisory* |
| **Chapter 1: Introduction** | Sections 1.1 through 1.6 strictly followed | **COMPLIANT** ✔ | 1.1 Background, 1.2 Problem Statement, 1.3 Aim & Objectives, 1.4 Scope, 1.5 Motivation, 1.6 Organisation |
| **Chapter 2: Literature Review** | Sections 2.1 through 2.4, comparative table, research gaps | **COMPLIANT** ✔ | 2.1 Intro, 2.2 Existing Systems, 2.3 Table 2.1 (7 dimensions), 2.4 Summary & Gap Identification |
| **Chapter 3: System Design & Methodology** | Architecture, DFD, ER, Normalization, ACID, Constraints, Triggers | **COMPLIANT** ✔ | Sections 3.1.1 to 3.1.12; Figures 3.1–3.5; 1NF–3NF mathematical proofs; 13 tables; CHECK constraints |
| **Chapter 4: Implementation** | Code snippets, API directory, UI walkthroughs, SQL demos, test results | **COMPLIANT** ✔ | 6 Listings; Table 4.1 (19 APIs); Figures 4.1–4.5; EXPLAIN ANALYZE; Concurrency test; Table 4.2 |
| **Chapter 5: Conclusion & Future Scope** | Summary, Objectives Achieved, Limitations, Future Enhancements | **COMPLIANT** ✔ | 5.1 Summary, 5.2 Table 5.1 (Objectives Matrix), 5.3 Limitations, 5.4 Future Enhancements |
| **References** | Harvard Referencing Style; genuine citations with in-text matches | **COMPLIANT** ✔ | 14 genuine, verifiable citations (CEA, DEFRA, EPA, IPCC, Elmasri & Navathe, Silberschatz et al.) |
| **Font & Body Typography** | Times New Roman, 12 pt body; Headings larger and bold | **COMPLIANT** ✔ | Configured across all document styles in `.docx` |
| **Line Spacing & Alignment** | 1.5 line spacing; Justified paragraph alignment | **COMPLIANT** ✔ | Applied to all body paragraphs via `python-docx` |
| **Margins** | Approximately 1 inch (72 pt) on all sides | **COMPLIANT** ✔ | Configured on all document sections |
| **Figure & Table Numbering** | Numbered by chapter (e.g., Table 2.1, Figure 3.1) with captions | **COMPLIANT** ✔ | 4 Tables (Table 2.1, 4.1, 4.2, 5.1) and 10 Figures (Fig 3.1–3.5, 4.1–4.5) |

---

## 2. Evaluation Rubrics Alignment (Targeting Grade O / Exemplary)

### Area 1: Problem Analysis
- **Demonstrated Competency:** Comprehensive breakdown of anthropogenic greenhouse gas accounting barriers, detailing the limitations of spreadsheets, opaque black-box calculators, and unverified emission factors.
- **Academic Rigor:** Distinguishes Scope 1 (direct fuels) and Scope 2 (purchased electricity) based on the GHG Protocol Corporate Standard and IPCC guidelines. Formulates clear mathematical problem definitions and operational scope boundaries.

### Area 2: Project Design
- **Demonstrated Competency:** Full relational modeling featuring an Entity Relationship (ER) Diagram (Figure 3.3) comprising 13 tables in Third Normal Form (3NF).
- **Advanced Database Architecture:** Domain check constraints (`chk_positive_quantity`, `chk_activity_workspace_scope`), referential integrity cascades (`ON DELETE CASCADE` / `SET NULL`), 31 B-tree indexes, 4 analytical reporting views (`v_monthly_emissions`, `v_category_emissions`), active triggers (`trg_audit_activities` logging JSONB to `audit_logs`), and stored procedures (`sp_record_activity_with_emissions`).

### Area 3: Project Implementation
- **Demonstrated Competency:** Authentic, operational full-stack application connecting:
  - Frontend: React 18, Vite 5, Tailwind CSS, Recharts.
  - Backend: Modular Node.js / Express REST API with bcrypt password hashing (12 rounds) and JWT authentication.
  - Database: PostgreSQL 18.6 enterprise persistence engine.
  - AI Microservice: Python FastAPI service with Pydantic schema validation, Google Gemini Interactions API integration, and an autonomous offline heuristic fallback engine.
- **Empirical Test Verification:** 100% pass rate across 5 automated test suites (54 total assertions):
  - `npm run test:db`: 7/7 passed.
  - `npm run test:api`: 25/25 passed.
  - `npm run test:ai`: 4/4 passed.
  - `npm run test:adbms`: 8/8 passed (including atomicity rollback and `EXPLAIN ANALYZE` index verification in 0.58 ms).
  - `npm run test:concurrency`: 10/10 simultaneous client transactions committed in 274 ms with zero deadlocks.

### Area 4: Project Report Quality
- **Demonstrated Competency:** 46 pages of in-depth technical documentation in both editable Microsoft Word (`.docx`, 2.27 MB) and Markdown (`.md`, 74 KB) formats.
- **DOCX Integrity & Word Validation:** Rebuilt through a strict validation pipeline and verified via Microsoft Word 16.0 COM automation (`Word.Application`). Word successfully opened the finalized document with **0 errors**, confirming that the file is completely valid, editable, and uncorrupted.
- **Figure & Diagram Quality:** 10 high-resolution (300 DPI) figures created specifically for the project, illustrating system architecture, data flows, ER modeling, transaction workflows, AI heuristics, and UI walkthroughs.
- **Referencing Discipline:** 100% genuine citations following the Harvard Referencing Style with bidirectional citation matching.

### Area 5: Communication & Presentation
- **Demonstrated Competency:** Clear, precise technical vocabulary avoiding vague colloquialisms. Code listings are formatted in clean monospace tables with contextual explanations.
- **Clarity of Roles:** Outlines the dual-student collaborative contributions and maintains consistent technical taxonomy throughout.

---

## 3. Student Action & Review Items Prior to Final Submission

1. **Faculty Supervisor Details:**
   - *Action:* If your department requires the Faculty Supervisor's / Guide's Name and Designation on the Cover Page or Certificate page, add it directly in Microsoft Word under the "Submitted To" section.
2. **Institutional Signatures:**
   - *Action:* Print the Declaration and Certificate pages (or export to PDF) for signing by both students (Piyush Khatwa and Shobhit Tiwari) and the project guide.
3. **Word Document Inspection:**
   - *Action:* Open `docs/CarbonIQ_Final_Project_Report.docx` in Microsoft Word to confirm that local margins, page breaks, and embedded figures align with your specific local printer/PDF margins.
4. **Demonstration Video / Live Viva Link:**
   - *Action:* If your evaluation panel requests a recorded video demonstration link or GitHub repository URL, place the link in the report's preliminary section.

