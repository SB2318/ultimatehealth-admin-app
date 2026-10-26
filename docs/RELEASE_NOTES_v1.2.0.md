# UltimateHealth Admin App - Release Notes v1.1.2

**Release Date:** October 26, 2026  
**Version:** 1.2.0 (Version Code: 18)  
**Target Environment:** Android (Play Store / APK) & iOS (App Store / TestFlight)  
**App Identifier:** `com.ultimatehealth.admin`  
**Developer:** Susmita Bhattacharya (`@SB2318`)  
**Project:** UltimateHealth (Open Source Initiative)  
**Metro Bundler Status:** Verified (4,505 modules compiled successfully)

---

## 🌟 Overview

UltimateHealth Admin App v1.1.2 brings complete feature parity with backend release **v3.5.0**, introducing an **Executive Governance Console** for Super Admins, verified **Staff Profile Dossiers** with activity tracking, real-time **Abuse Reason Metrics**, an in-app **Doctor Candidate CV & Document Inspector**, and an upgraded, interactive **Guest Mode & Sandbox**.

As part of the UltimateHealth open-source initiative, this release focuses on giving maintainers, moderators, and community reviewers reliable tools to review health articles, manage team access, and audit content efficiently.

---

## 🚀 Key Features & Highlights

### 1. 🛡️ Super Admin Executive Console
- **Platform Analytics Overview (`GET /api/admin/platform-analytics`)**:
  - Workforce indicators (Active, Suspended, Total Staff, and Doctor Applicants).
  - Editorial pipeline velocity (Unassigned, In-Review, and Published clinical articles).
  - Moderation triage metrics (Pending vs. Resolved incident reports).
  - Master data coverage (Specializations & Localized languages count).
- **Interactive Sandbox & Empty Queue Guard**:
  - Automatically loads fallback benchmarks in Guest Mode or when database collections have 0 records, preventing broken screens.

### 2. 👨‍⚕️ Doctor Applicants Queue & In-App CV Inspector
- **Authentication & Pagination Fix**:
  - Passed Super Admin Bearer authorization token headers to `GET /api/admin/applicants`.
  - Upgraded parser to unpack backend pagination structure `{ success: true, data: { applicants: [...] } }`.
- **In-App Document Viewer (`openApplicantDocument`)**:
  - Resolves both relative S3 keys (`applicant-resumes/...`) and direct URLs via `/api/getFile`.
  - Uses **Expo WebBrowser** with Google Docs PDF preview wrapper (`https://docs.google.com/viewer?url=...`), opening PDFs directly inside the app without requiring an external PDF reader.
  - Added direct **"CV Document"** button on applicant cards and an inspection block in the candidate modal.

### 3. 👥 Staff Directory, Status Toggling & Profile Dossiers
- **Staff Status Toggling (`PUT /api/admin/:id/status`)**:
  - Super Admins can immediately suspend or reactivate moderator accounts.
  - Built-in guardrails prevent self-blocking and Super Admin suspension.
  - Optimistic UI updates with instant haptic and snackbar feedback.
- **Staff Profile Dossier (`GET /api/admin/profile/:id`)**:
  - Modal dossier with reviewer metrics (Articles reviewed, Improvements evaluated, Reports handled).
  - Permissions matrix visualization (`canReviewArticles`, `canInspectDiffs`, `canManageReports`, `canAuditGlobal`).
  - Digital signature preview and verified contributor badges.

### 4. ⚖️ Abuse Report Categories with Metric Breakdown
- **Abuse Metrics (`GET /api/report/reasons/metrics`)**:
  - Displays real-time counts for `activeReportsCount`, `resolvedReportsCount`, and `totalReportsCount`.
  - Category status chips with high-visibility alert banners for categories with active pending violations.

### 5. 🧭 Enhanced Guest Explorer & Governance Sandbox
- **Revamped Login Entry Point**:
  - Redesigned "Explore in Guest Mode" card with capability chips (`Governance Console`, `Applicant CVs`, `AI & Plagiarism`).
- **Interactive Governance Sandbox**:
  - Evaluators get an isolated sandbox environment with full mock datasets across Articles, Improvements, Podcasts, Staff Members, and Applicants.
  - Blue **"Guest Governance Sandbox"** banner indicates simulated actions.

---

## 🛠️ API & Endpoint Reference Table

| Feature | Method | Endpoint Route | Auth Level |
| :--- | :---: | :--- | :--- |
| **Platform Analytics** | `GET` | `/api/admin/platform-analytics` | Super Admin |
| **Staff Profile Dossier** | `GET` | `/api/admin/profile/:id` | Super Admin |
| **Staff Block / Unblock** | `PUT` | `/api/admin/:id/status` | Super Admin |
| **Abuse Reasons Metrics** | `GET` | `/api/report/reasons/metrics` | Admin / Super Admin |
| **Applicant Queue** | `GET` | `/api/admin/applicants` | Super Admin |
| **Applicant Status Update** | `PUT` | `/api/admin/applicants/:id/status` | Super Admin |
| **Provision Admin Account** | `POST` | `/api/admin/applicants/:id/create-admin` | Super Admin |
| **Plagiarism Checker** | `POST` | `/veiwise/plagiarism/check` | Reviewer |
| **AI Grammar Checker** | `POST` | `/veiwise/grammar/check-grammar` | Reviewer |

---

## 📱 Mobile Quality & Build Health Verification

- **TypeScript Typecheck:** 0 errors in all modified files (`SuperAdminDashboard.tsx`, `LoginScreen.tsx`, `APIUtils.ts`, `DemoData.ts`, `type.ts`).
- **Expo / Metro Bundler:** 4,505 modules compiled successfully for both Android and iOS targets.
- **Asset Integrity:** Verified adaptive launcher icons and splash assets.
- **Firebase SDK:** Configured with `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
- **EAS Profile:** Ready for `eas build --platform android --profile production` and preview APK generation.

---

## 👥 Contributors & Open Source Sign-off

- **Lead Developer & Maintainer:** Susmita Bhattacharya (`@SB2318`)
- **Initiative:** UltimateHealth Open Source Project
