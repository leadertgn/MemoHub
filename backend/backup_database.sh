#!/bin/bash

###############################################################################
# Database Backup Script for MemoHub
#
# Usage: bash backup_database.sh
#
# This script:
# 1. Backs up the PostgreSQL database
# 2. Backs up the seed.py file
# 3. Creates timestamped backup directory
# 4. Safe to run before migrations
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_DIR="$BACKUP_DIR/db_backup_$TIMESTAMP"
SEED_BACKUP_DIR="$DB_BACKUP_DIR/seed_backup"

echo -e "${YELLOW}=================================================================================${NC}"
echo -e "${YELLOW}MemoHub Database Backup Script${NC}"
echo -e "${YELLOW}=================================================================================${NC}"
echo ""

# Create backup directory structure
echo -e "${YELLOW}[1/4]${NC} Creating backup directories..."
mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$SEED_BACKUP_DIR"
echo -e "${GREEN}✓${NC} Backup directories created at: $DB_BACKUP_DIR"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}✗ ERROR${NC}: .env file not found!"
    echo "Please ensure you are in the backend directory and .env is configured."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ ERROR${NC}: DATABASE_URL not set in .env"
    exit 1
fi

# Extract database connection parameters
# Format: postgresql+psycopg2://user:password@host:port/dbname
DB_URL=$DATABASE_URL
# Remove the protocol prefix
DB_URL=${DB_URL#postgresql+psycopg2://}
# Extract user and password
DB_CREDENTIALS=${DB_URL%@*}
DB_USER=${DB_CREDENTIALS%:*}
DB_PASSWORD=${DB_CREDENTIALS#*:}
# Extract host and dbname
DB_LOCATION=${DB_URL#*@}
DB_HOST=${DB_LOCATION%/*}
DB_NAME=${DB_LOCATION##*/}
# Remove query parameters
DB_NAME=${DB_NAME%%\?*}

echo -e "${YELLOW}[2/4]${NC} Backing up PostgreSQL database..."
echo "  Host: $DB_HOST"
echo "  Database: $DB_NAME"
echo "  Backup file: $DB_BACKUP_DIR/memohub_$TIMESTAMP.sql"
echo ""

# Create full SQL backup
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-password \
  --verbose \
  > "$DB_BACKUP_DIR/memohub_$TIMESTAMP.sql" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Database backup completed successfully"
    DB_SIZE=$(du -h "$DB_BACKUP_DIR/memohub_$TIMESTAMP.sql" | cut -f1)
    echo "  Backup size: $DB_SIZE"
else
    echo -e "${RED}✗ ERROR${NC}: Database backup failed!"
    echo "Check your DATABASE_URL and PostgreSQL credentials in .env"
    exit 1
fi
echo ""

# Backup seed.py
echo -e "${YELLOW}[3/4]${NC} Backing up seed.py file..."
if [ -f seed.py ]; then
    cp seed.py "$SEED_BACKUP_DIR/seed_$TIMESTAMP.py"
    echo -e "${GREEN}✓${NC} seed.py backed up"
else
    echo -e "${YELLOW}⚠${NC}  seed.py not found in current directory (optional)"
fi
echo ""

# Create a metadata file
echo -e "${YELLOW}[4/4]${NC} Creating backup metadata..."
cat > "$DB_BACKUP_DIR/BACKUP_INFO.txt" << EOF
================================================================================
MemoHub Database Backup Information
================================================================================

Backup Timestamp: $TIMESTAMP
Database: $DB_NAME
Host: $DB_HOST

Files:
  - memohub_$TIMESTAMP.sql (SQL dump of database)
  - BACKUP_INFO.txt (this file)
  - seed_backup/ (archived seed files)

To restore this backup:
  1. Create a new database (if needed)
  2. Run: PGPASSWORD="<password>" psql -h <host> -U <user> -d <dbname> < memohub_$TIMESTAMP.sql

Important:
  - Keep this backup secure (contains production data)
  - Test restoration in staging before production recovery
  - Database password was required to create this backup

Created: $(date)
================================================================================
EOF

echo -e "${GREEN}✓${NC} Backup metadata created"
echo ""

# Summary
echo -e "${YELLOW}=================================================================================${NC}"
echo -e "${GREEN}✓ BACKUP COMPLETED SUCCESSFULLY${NC}"
echo -e "${YELLOW}=================================================================================${NC}"
echo ""
echo "Backup location: $(cd $DB_BACKUP_DIR && pwd)"
echo "Total files backed up:"
ls -lh "$DB_BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the backup files"
echo "2. Test migrations in test environment first"
echo "3. Keep this backup until migrations are verified in production"
echo ""
