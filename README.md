# Smart Expense Tracker API — Full-Stack Fintech Platform & Debugging Challenge

## 1. Application Overview
**Smart Expense Tracker API** is a production-grade, highly modular Node.js/Express financial backend and debugging challenge designed to simulate real-world fintech systems and QA automation. Built around a modern Personal Finance & Wealth Management theme, the application combines multi-wallet tracking, dynamic budget auditing, analytical reporting, and deterministic state persistence.

### Key Capabilities
- **Multi-Wallet Ledger Management**: Real-time balance computation across cash, bank, and digital asset wallets.
- **Budget Tracking & Limit Thresholds**: Monthly threshold monitoring with automated overspending alerts and progress tracking.
- **Expense Categorization & Filtering**: Multi-parameter search and query filtering across categories, dates, and transaction types.
- **Financial Analytics & Reporting**: Automated generation of monthly financial summaries, category breakdowns, and net-worth health reports.
- **Interactive API & UI**: An embedded RESTful HTTP API and Glassmorphism Web Dashboard allowing users to manage transactions and inspect financial health.

### Technology Stack
- **Backend**: Node.js v22, Express.js (RESTful API Server)
- **Database**: Local JSON File Datastore (`data/db.json`) with deterministic seed data
- **Frontend**: HTML5, Vanilla JS, CSS3 Glassmorphism UI
- **Testing**: Jest, Supertest, Custom JSON Test Reporter

---

## 2. Debugging Challenge

This repository contains **5 realistic logical bugs** reported by QA automation and beta testers. These issues involve HTTP specification compliance, arithmetic calculations, multi-tenant authorization, query filtering, and string normalization.

### Bug 1 — Expense Deletion Status Code Bug
- **User Symptom**: QA reports that when deleting an expense record via the API, the server responds with HTTP 200 OK containing an empty payload instead of the standardized HTTP 204 No Content status code.
- **Module**: Expense Management / Expense Controller

### Bug 2 — Budget Balance Calculation Bug
- **User Symptom**: QA reports that adding new expenses to a budgeted category increases the displayed remaining budget rather than deducting from the allocated monthly limit.
- **Module**: Budgeting Engine / Budget Service

### Bug 3 — Cross-Tenant Wallet Authorization Bug
- **User Symptom**: QA security auditing discovered that an authenticated user can modify and rename arbitrary wallets belonging to other users by providing another user's wallet ID in a PATCH request.
- **Module**: Wallet Subsystem / Wallet Service

### Bug 4 — Expense Monthly Filter Bug
- **User Symptom**: QA reports that querying expenses filtered by a specific month returns transactions from all months indiscriminately, ignoring the requested month filter parameter.
- **Module**: Expense Query Engine / Expense Service

### Bug 5 — Email Uniqueness Case-Sensitivity Bug
- **User Symptom**: QA reports that user registration allows duplicate accounts to be created if the same email address is supplied with differing letter casing (e.g., `user@example.com` vs `USER@example.com`).
- **Module**: Identity & Authentication / Auth Service

---

## 3. Expected Behavior After Fixes
Once all 5 bugs are diagnosed and resolved:
1. Deleting an expense via `DELETE /api/expenses/:id` returns an HTTP 204 No Content response.
2. The remaining budget correctly deducts expenditure from the monthly limit (`limit - spent`).
3. Wallet modification requests verify user ownership and reject unauthorized cross-user modifications with HTTP 403 Forbidden.
4. Filtering expenses by month accurately extracts only transactions dated within the targeted month.
5. Email uniqueness validation normalizes casing (case-insensitive) and rejects duplicate registrations with HTTP 409 Conflict.
