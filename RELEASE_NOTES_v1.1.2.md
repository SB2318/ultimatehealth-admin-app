# UltimateHealth Admin App - Release Notes v1.1.2

**Release Date:** October 26, 2026  
**Version:** 1.1.2 (Version Code: 18)  
**Target Environment:** Android (Play Store / APK) & iOS (App Store / TestFlight)  
**App Identifier:** `com.ultimatehealth.admin`  
**Metro Bundler Status:** Verified (4,505 modules compiled successfully)

---

## 🌟 Executive Summary

UltimateHealth Admin App v1.1.2 brings complete feature parity with backend release **v3.5.0**, introducing an **Executive Governance Console** for Super Admins, verified **Staff Profile Dossiers** with credential auditing, real-time **Abuse Reason Metrics**, an in-app **Doctor Candidate CV & Document Inspector**, and an upgraded, interactive **Guest Mode & Governance Sandbox**.

---

## 🚀 Key Features & Highlights

### 1. 🛡️ Super Admin Executive Governance Console
- **Platform Analytics Overview (`GET /api/admin/platform-analytics`)**:
  - Live workforce indicators (Active, Suspended, Total Staff, and Doctor Applicants).
  - Editorial pipeline velocity (Unassigned, In-Review, and Published clinical articles).
  - Moderation triage metrics (Pending vs. Resolved incidents).
  - Master data coverage (Specializations & Localized languages).
- **Interactive Sandbox & Empty Queue Guard**:
  - Automatically activates demo benchmarks in Guest Mode or when live databases return zero records, ensuring zero UI breakage.

### 2. 👨‍⚕️ Doctor Applicants Queue & In-App CV Inspector
- **Authentication & Pagination Fix**:
  - Passed Super Admin Bearer authorization token headers to `GET /api/admin/applicants`.
  - Upgraded parser to unpack `{ success: true, data: { applicants: [...] } }`.
- **In-App Document Viewer (`openApplicantDocument`)**:
  - Resolves both relative S3 keys (`applicant-resumes/...`) and absolute URLs via `/api/getFile`.
  - Utilizes **Expo WebBrowser** with Google Docs PDF preview wrapper (`https://docs.google.com/viewer?url=...`), eliminating failures on Android devices lacking dedicated PDF reader apps.
  - Added direct **"CV Document"** quick-action button on candidate cards and an enhanced document inspection block in the applicant detail modal.

### 3. 👥 Staff Directory, Status Toggling & Profile Dossiers
- **Staff Status Toggling (`PUT /api/admin/:id/status`)**:
  - Super Admins can immediately suspend or reactivate staff accounts.
  - Built-in guardrails prevent self-blocking and Super Admin suspension.
  - Optimistic UI updates with instant haptic and snackbar feedback.
- **Staff Profile Dossier (`GET /api/admin/profile/:id`)**:
  - Modal dossier with reviewer metrics (Articles reviewed, Improvements evaluated, Reports handled).
  - Permissions matrix visualization (`canReviewArticles`, `canInspectDiffs`, `canManageReports`, `canAuditGlobal`, etc.).
  - Clinical credentials verification badge and verified digital signature inspection.

### 4. ⚖️ Abuse Report Categories with Metric Breakdown
- **Abuse Metrics (`GET /api/report/reasons/metrics`)**:
  - Displays real-time counts for `activeReportsCount`, `resolvedReportsCount`, and `totalReportsCount`.
  - Category status chips with high-visibility alert banners for categories with active pending violations.

### 5. 🧭 Enhanced Guest Explorer & Governance Sandbox
- **Revamped Login Entry Point**:
  - Redesigned "Explore in Guest Mode" card with capability chips (`Governance Console`, `Applicant CVs`, `AI & Plagiarism`, `Reviewer Queue`).
- **Interactive Governance Sandbox**:
  - Guest users receive an isolated sandbox environment with full mock datasets across Articles, Improvements, Podcasts, Staff Members, and Applicants.
  - Distinctive **"Guest Governance Sandbox"** banner informs evaluators that actions are safely simulated.

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
- **Asset Integrity:** Verified adaptive foreground/background launcher icons and splash assets.
- **Firebase SDK:** Registered and configured (`google-services.json` & `GoogleService-Info.plist`).
- **EAS Profile:** Ready for `eas build --platform android --profile production` and preview APK generation.

---

## 👥 Contributors & Release Sign-off

- **Platform Architect & Lead Developer:** Subham Bhattacharya (`@SB2318`)
- **Review Board:** UltimateHealth Medical Editorial & Quality Assurance Council
