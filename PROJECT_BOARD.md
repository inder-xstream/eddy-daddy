# Project Audit & Pending Work

## 🔴 Critical Gaps (Must Fix)
- **Testing**:
  - [x] Setup Jest or Vitest (Vitest intalled).
  - [x] Add unit tests for `auth-helper` and server actions (Smoke test created).
- **Admin Pagination**:
  - [x] Add Previous/Next buttons to VideoList.
- **User Settings**:
  - [x] Create `app/settings/page.tsx`.
- **Legal Compliance**:
  - [x] Replace placeholder text in `app/legal` pages.

## 🟡 Technical Debt (Should Fix)
- **Documentation Cleanup**:
  - [x] `AUTH_SETUP.md` refers to deleted pages.
  - [x] `SCHEMA_COMPARISON_ANALYSIS.md` is deleted.
  - [x] `page_v2.tsx` (Features merged to `page.tsx`).
- **Hardcoded Logic**:
  - [x] `app/page.tsx`: Ad injection positions moving to config.
  - [x] `lib/redis.ts`: Rate limits are env var ready.
- **Search**:
  - [x] `app/search/page.tsx` added Sort filters.

## 🟢 Feature Enhancements (Future)
- **Analytics**:
  - [ ] Admin Dashboard has no charts.
  - [ ] User Profile shows counts but no detailed analytics for creators.
- **Engagement**:
  - [ ] No "Watch Later" or Playlist functionality.
  - [ ] No Social Sharing buttons.
  - [ ] No Reporting/Flagging system for bad content.
- **Notifications**:
  - [ ] No notification system for "Video Processed" or "New Subscriber".

## 🧹 Post-Audit Cleanup Actions
- [x] Delete `garb/schema2.prisma`
- [x] Delete `page_v2.tsx`
