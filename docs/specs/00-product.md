# What are we building

## Document scope

This document provides an overview of our product and current product-level decisions.

## One paragraph description

A Gym Tracking application with a delightful interface, advanced analytics, AI powered advisor and Social Groups so that no one can cheat on their PRs again!

* Simple, quick, interface that combines depth and delightful golden paths.
* Powerful analytics that allows an incredible level of geek out.
* Exercises support Locations and Variations and are connected to Muscle Groups trained.
* Brotherhoods (Group) concept enables PR certification, Group level competitions, Group sanctioned Exercises. 
* AI integration powers AI coaches and AI analysis of performance trends.

## Product decisions (current)

- Date: `2026-02-27`
- Decision: Exercise variations are optional and key/value based.
- Notes:
  - no variation is required to log an exercise,
  - system seeds key families (`grip`, `hold`, `machine`, `implement`, `incline`) and starter values,
  - users can add new keys and values.

- Date: `2026-02-27`
- Decision: Variation authoring is catalog-first for M9.
- Notes:
  - primary create/edit surface is exercise management,
  - recorder flow prioritizes fast logging and optional variation selection.

- Date: `2026-02-27`
- Decision: Exercise/variation/mapping metadata semantics are retroactive.
- Notes:
  - edits to exercise and variation metadata apply across history presentation,
  - future analytics interpretation is based on latest metadata (no versioned/snapshot metadata model in M9).
