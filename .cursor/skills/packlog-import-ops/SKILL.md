---

## name: packlog-import-ops
description: Standardized workflow for PACKLOG link ingestion to community templates, including schema extraction, brand normalization, multilingual online rendering strategy, image capture, and post-import QC report generation. Use whenever the user provides links/screenshots for checklist ingestion, asks for import pipeline execution, or requests reusable import QA process.

# PACKLOG Import Ops

## Goals

- Ingest external checklist content into PACKLOG community templates.
- Keep schema strict, brand mapping consistent, and multilingual rendering flexible.
- Generate QC report after each import batch.

## Workflow

1. Parse source links into import batches (PackHacker, REI, other guides, user profile pages).
2. Extract template-level metadata and item-level rows using approved enums.
3. Normalize brands against `src/shared/brand-library.ts`.
4. Persist only stable structured fields; keep multilingual longform content online-generated at render time.
5. Attach image URLs when available and verify item-image relevance.
6. Run QC script:

```bash
npm run import:qc -- --input "<csv-path>" --output "<qc-md-path>" --source "<source-name>"
```

1. Output:

- migration/sql summary
- changed templates/items counts
- QC report path
- manual review list (high risk only)

## Constraints

- Never create new enum values without explicit migration.
- Never bypass brand normalization.
- Never mix zh/en in the same rendered block for one language context.
- Do not mark item as must-have unless source explicitly states mandatory requirement.

## Post-import Checklist

- `category/status/container` validity = 100%
- brand coverage and unresolved brands listed
- image coverage and mismatches listed
- multilingual rendering check (zh-CN, zh-TW, en)
- UX sanity check on community drawer/card

