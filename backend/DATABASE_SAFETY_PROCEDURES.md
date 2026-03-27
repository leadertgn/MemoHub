# 🔒 Database Safety Procedures for MemoHub

## Overview

Before implementing database migrations, we have created THREE SAFETY SCRIPTS to protect your data:

1. **`backup_database.sh`** - Backup production database + seed.py
2. **`test_migrations.sh`** - Test migrations on a database copy
3. **`.env.example`** - Template for Brevo email configuration

---

## 📋 Pre-Migration Checklist

### Step 1: Verify Brevo Configuration

**Action Required:** Get your Brevo API key

```bash
# If you don't have a Brevo account:
1. Go to https://brevo.com/
2. Sign up for a free account
3. Navigate to SMTP section → API Keys
4. Copy your API key
```

**Update .env:**

```bash
BREVO_API_KEY=your_api_key_here
BREVO_SENDER_EMAIL=noreply@memohub.africa
BREVO_SENDER_NAME=MemoHub
```

---

### Step 2: Backup Your Database

**Run before ANY migrations:**

```bash
cd backend
bash backup_database.sh
```

**What it does:**

- Creates timestamped backup directory
- Exports full PostgreSQL database as SQL
- Backs up seed.py
- Creates backup metadata file

**Output location:** `./backups/db_backup_YYYYMMDD_HHMMSS/`

---

### Step 3: Test Migrations on Copy

**Run BEFORE applying to production:**

```bash
cd backend
bash test_migrations.sh
```

**What it does:**

1. Creates a copy of your database named: `{DB_NAME}_test_migration_YYYYMMDD_HHMMSS`
2. Runs all pending Alembic migrations on the copy
3. Verifies migrations completed successfully
4. **YOUR ORIGINAL DATABASE REMAINS UNTOUCHED**

**Output:** Shows last 5 migrations applied

---

### Step 4: If Test Passes → Apply to Production

Once `test_migrations.sh` completes successfully:

```bash
cd backend

# Make sure you're using the ORIGINAL .env (not the test one)
cat .env | grep DATABASE_URL
# Should show your production database, not the test database

# Run migrations on production
alembic upgrade head

# Verify
python seed.py  # If needed to reseed data
```

---

## 🚨 Emergency Rollback (If Something Goes Wrong)

```bash
# If migrations fail, you have a backup!

# 1. Stop the application
cd backend
# Kill the running FastAPI server

# 2. Restore from backup
PGPASSWORD="your_password" psql -h your_host -U your_user -d memohub < ./backups/db_backup_YYYYMMDD_HHMMSS/memohub_YYYYMMDD_HHMMSS.sql

# 3. Verify restoration
python -c "from app.database import engine; print('DB connection OK')"

# 4. Restart application
uvicorn app.main:app --reload
```

---

## 📊 Files Reference

### `.env.example` - New Configuration Template

Added:

```env
# Email Notifications (Brevo)
BREVO_API_KEY=your-brevo-api-key-here
BREVO_SENDER_EMAIL=noreply@memohub.africa
BREVO_SENDER_NAME=MemoHub

# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# OAuth Redirect URIs
ALLOWED_REDIRECT_URIS=http://localhost:5173/auth/callback,https://memohub.africa/auth/callback

# Environment
ENVIRONMENT=development
```

---

## 🔄 Backup Script Details

**`backup_database.sh`**

```bash
bash backup_database.sh
```

Creates:

```
./backups/db_backup_20260327_143022/
├── memohub_20260327_143022.sql    (Full database dump)
├── BACKUP_INFO.txt                 (Metadata)
└── seed_backup/
    └── seed_20260327_143022.py     (Archived seed file)
```

---

## 🧪 Migration Test Script Details

**`test_migrations.sh`**

```bash
bash test_migrations.sh
```

Process:

1. ✅ Reads current database name from .env
2. ✅ Creates duplicate: `{DB}_test_migration_TIMESTAMP`
3. ✅ Runs `alembic upgrade head` on the copy
4. ✅ Shows migration history
5. ✅ Leaves test DB for inspection (or auto-cleanup)
6. ✅ Restores original .env

**Important:**

- Your production database is NEVER modified
- Test database persists for inspection
- Manually drop when done: `dropdb -h host -U user test_db_name`

---

## 📌 Recommended Timeline

### Day 1-2 (Security Fixes)

```
1. Update .env.example with Brevo variables ✓ DONE
2. Get Brevo API key (you do this)
3. Update .env with Brevo credentials
4. Implement OAuth CSRF fix
5. Implement redirect URI whitelist
6. Mask error messages
```

### Day 3-5 (Before Migrations)

```
1. RUN: bash backup_database.sh          ← CRITICAL
2. RUN: bash test_migrations.sh          ← CRITICAL
3. Review test database results
4. If good → Apply migrations to production
5. Verify seed.py if needed
6. Test endpoints
```

---

## ✅ Safety Checklist

Before running _any_ migrations:

- [ ] `.env` is populated with all variables
- [ ] Brevo API key is valid
- [ ] `backup_database.sh` completed successfully
- [ ] `test_migrations.sh` completed successfully
- [ ] You have verified the test database looks correct
- [ ] You have a copy of your backup directory in a safe location
- [ ] You understand the rollback procedure above

---

## 🎯 Troubleshooting

### Error: ".env file not found"

```bash
cd backend
# Make sure you're in the backend directory
ls -la | grep .env
```

### Error: "DATABASE_URL not set in .env"

```bash
# Check your .env file
cat .env | grep DATABASE_URL
# Should show your PostgreSQL connection string
```

### Error: "createdb: connection refused"

```bash
# PostgreSQL service not running
# On Mac: brew services start postgresql
# On Linux: sudo service postgresql start
# On Windows: Use Services app to start PostgreSQL
```

### Error: "psql: command not found"

```bash
# PostgreSQL client not installed
# Install PostgreSQL client tools:
# Mac: brew install postgresql
# Ubuntu: apt-get install postgresql-client
# Windows: Install PostgreSQL (includes psql)
```

---

## 📚 Reference

- **Brevo Docs:** https://brevo.com/docs/
- **Alembic Docs:** https://alembic.sqlalchemy.org/
- **PostgreSQL Backup Docs:** https://www.postgresql.org/docs/14/app-pgdump.html

---

## 🚀 When Ready to Launch

1. All backups created ✅
2. Migrations tested on copy ✅
3. Production migrations applied ✅
4. Endpoints verified ✅
5. Email notifications working ✅
6. Audit logs recording ✅

**→ Ready for Phase 2 Frontend** 🎉

---

**Created:** 27 Mars 2026
**For:** MemoHub MVP Implementation
**Safety Level:** CRITICAL - DATA PROTECTION
