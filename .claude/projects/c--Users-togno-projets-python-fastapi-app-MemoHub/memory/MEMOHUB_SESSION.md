# MemoHub Project Memory - Session 2026-03-26

## Project Overview

**MemoHub:** Platform where students find and share academic memoirs (theses) from different universities/degrees

- **MVP Scope:** 1 university + filières + advanced search + moderation
- **Long-term:** Multi-university, multi-country expansion (Africa-focused)
- **Target:** "LinkedIn of African Academia"

## Current Status

- **Backend:** 95% complete - Production ready
- **Frontend:** 20% complete - Pages missing
- **Overall MVP:** 60% complete

## Architecture Decisions (LOCKED IN)

✅ **Database:** PostgreSQL + SQLModel (well-designed for multi-university)
✅ **Auth:** Google OAuth2 + JWT (24h)
✅ **File Storage:** Cloudinary (PDFs, signed URLs)
✅ **Frontend:** React 19 + Vite + TailwindCSS
✅ **Scalability:** Domaines normalisés, countries/universities entities planned for future

## What's Built (Backend)

### Models ✅

- User (Google OAuth)
- Memoir (with metadata, status workflow)
- University (validation pending → approved)
- FieldOfStudy (per-university)
- Domain (normalized, cross-university search)
- Country (geographic expansion ready)

### API Endpoints ✅

- Auth: Google OAuth redirect
- Memoirs: LIST (with cascading filters), GET, CREATE, UPDATE status, DELETE
- Universities: LIST, CREATE (validation), PATCH status
- Domains: LIST, CREATE, UPDATE, DELETE
- FieldsOfStudy: LIST, CREATE, UPDATE, DELETE
- Countries: LIST
- Users: GET /me, UPDATE /me
- Admin: STATS (total users/memoirs), pending lists

### Features ✅

- Search: Cascading filters (domain → country → university → field) + text search with UNACCENT
- Permissions: student/moderator/admin roles, granular endpoint protections
- File Management: Upload to Cloudinary, signed URLs (60s download, 30min view)
- Moderation: Approval workflow (pending → approved/rejected)

## What's Missing (Frontend - CRITICAL)

### Pages to Build (PRIORITY ORDER)

1. **Login page** (OAuth redirect + token storage) - 3 days
2. **Search page** (cascading filters, display results) - 2 days
3. **Memoir Detail** (PDF viewer, metadata, download button) - 3 days
4. **Upload page** (form + Cloudinary multipart) - 3 days
5. **Admin Dashboard** (stats) - 1 day
6. **Admin Pending** (approve/reject memoirs) - 1 day

### Components Missing

- PDF.js integration (viewer)
- OAuth token management (frontend)
- Error handling (toast notifications)
- Loading states
- Responsive design testing

## Architecture Assessment for Scalability

### ✅ Well-Designed for Growth

- Domaines normalized = cross-university search without data migration
- University as entity = easy to add new ones
- Countries in schema = ready for multi-country
- Permissions planned for local moderators per university
- Quota system framework ready (just needs implementation)

### ⚠️ Needs Optimization Before 100K Memoirs

- Full-text search: Add PostgreSQL GIN index
- Caching: Redis for domaines/countries (don't change)
- Quotas: Add university upload limits
- Async jobs: Celery for background tasks
- Local moderators: Per-university permission system

## Critical Path to MVP (4 weeks)

```
Week 1: OAuth + Login
Week 2: Upload + Detail + Search polish
Week 3: Admin + Testing
Week 4: Deploy soft launch
```

## Files Created This Session

- `README_ANALYSIS.md` - Executive summary, visual roadmap
- `FRONTEND_ROADMAP.md` - Code templates, step-by-step guide
- `MVP_ANALYSIS.md` - Deep technical analysis
- `SCALABILITY_OPTIMIZATION.md` - Post-MVP optimization guide
- `SECURITY.md` - Security best practices (done earlier)
- `CHECKLIST.md` - Action items checklist

## Dependencies/Tools

- **Backend:** FastAPI, SQLModel, Cloudinary, python-jose (JWT), httpx
- **Frontend:** React 19, Vite, TailwindCSS, React Router v7, React Query, react-oauth/google (to add), pdfjs-dist (to add)
- **Database:** PostgreSQL with UNACCENT extension, Alembic migrations
- **Deployment:** Docker ready (docker-compose for dev)

## Key Metrics

- **Line Count:** ~2,159 lines (backend + frontend combined)
- **API Endpoints:** 30+
- **Database Tables:** 8 (User, Memoir, University, FieldOfStudy, Domain, Country, + alembic_version, alembic_version_id)
- **User Roles:** 3 (student, moderator, admin)
- **Degree Levels:** 6 (licence, master, doctorat, ingenieur, bts, dut)

## Risks & Mitigations

| Risk                    | Mitigation                            |
| ----------------------- | ------------------------------------- |
| PDF viewer doesn't work | Test early with multiple PDF types    |
| OAuth token expiry      | Implement refresh logic               |
| Cloudinary upload slow  | Add retry logic + queue               |
| Database slow at scale  | Plan indexing now, implement post-MVP |
| Admin overwhelmed       | Design local moderators for v2        |

## Growth Path

- **Month 1:** MVP launch with your university
- **Month 2-3:** Optimize performance (index, cache, quotas)
- **Month 4-6:** Invite 2-3 other universities (test multi-university)
- **Month 7-9:** Expand to other countries
- **Month 10+:** 50+ universities, 100K+ memoirs, possibly premium model

## Notes for Future Sessions

- Frontend build should follow FRONTEND_ROADMAP.md file structure
- Security is solid - no changes needed there
- Database schema is well-thought - likely no changes pre-MVP
- Test thoroughly with large datasets before post-MVP optimization
- Track performance metrics from day 1
- Backup planning: if OAuth has issues, consider Firebase Auth as fallback
