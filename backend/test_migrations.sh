#!/bin/bash

###############################################################################
# Test Migrations on Database Copy
#
# Usage: bash test_migrations.sh
#
# This script:
# 1. Creates a copy of the current database
# 2. Runs all pending migrations on the copy
# 3. Validates migrations succeeded
# 4. Leaves copy for inspection (or rollback to original)
#
# SAFE: Does NOT modify your production database
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}==================================================================================${NC}"
echo -e "${YELLOW}MemoHub Migration Test Script${NC}"
echo -e "${YELLOW}==================================================================================${NC}"
echo ""

# Load environment variables
if [ ! -f .env ]; then
    echo -e "${RED}✗ ERROR${NC}: .env file not found!"
    exit 1
fi

export $(cat .env | grep -v '^#' | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ ERROR${NC}: DATABASE_URL not set in .env"
    exit 1
fi

# Extract database connection parameters
DB_URL=$DATABASE_URL
DB_URL=${DB_URL#postgresql+psycopg2://}
DB_CREDENTIALS=${DB_URL%@*}
DB_USER=${DB_CREDENTIALS%:*}
DB_PASSWORD=${DB_CREDENTIALS#*:}
DB_LOCATION=${DB_URL#*@}
DB_HOST=${DB_LOCATION%/*}
DB_NAME=${DB_LOCATION##*/}
DB_NAME=${DB_NAME%%\?*}

# Create test database name
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEST_DB_NAME="${DB_NAME}_test_migration_${TIMESTAMP}"

echo -e "${YELLOW}[1/5]${NC} Configuration:"
echo "  Original DB: $DB_NAME"
echo "  Test DB: $TEST_DB_NAME"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo ""

# Step 1: Create a copy of the database
echo -e "${YELLOW}[2/5]${NC} Creating database copy..."
PGPASSWORD="$DB_PASSWORD" createdb \
  -h "$DB_HOST" \
  -U "$DB_USER" \
  -T "$DB_NAME" \
  "$TEST_DB_NAME" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Test database created: $TEST_DB_NAME"
else
    echo -e "${RED}✗ ERROR${NC}: Failed to create test database!"
    exit 1
fi
echo ""

# Step 2: Create a temporary .env for test database
echo -e "${YELLOW}[3/5]${NC} Configuring test environment..."
TEST_DB_STRING="postgresql+psycopg2://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/${TEST_DB_NAME}?sslmode=require"

# Create backup of current .env
cp .env .env.backup.test

# Temporarily update DATABASE_URL for testing
sed -i "s|DATABASE_URL=.*|DATABASE_URL=${TEST_DB_STRING}|" .env

echo -e "${GREEN}✓${NC} Environment configured for test database"
echo ""

# Step 3: Run migrations on test database
echo -e "${YELLOW}[4/5]${NC} Running migrations on test database..."
echo "  This may take a few moments..."
echo ""

if alembic upgrade head 2>&1; then
    echo -e "${GREEN}✓${NC} Migrations completed successfully!"
else
    echo -e "${RED}✗ ERROR${NC}: Migrations failed on test database!"
    echo ""
    echo -e "${YELLOW}Rolling back...${NC}"
    # Restore original .env
    mv .env.backup.test .env
    # Drop test database
    PGPASSWORD="$DB_PASSWORD" dropdb -h "$DB_HOST" -U "$DB_USER" "$TEST_DB_NAME" 2>/dev/null || true
    echo -e "${RED}Cleanup completed. Original database untouched.${NC}"
    exit 1
fi
echo ""

# Step 4: Verify migrations
echo -e "${YELLOW}[5/5]${NC} Verifying migration results..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB_NAME" << 'SQL'
SELECT version, description, installed_on
FROM alembic_version
ORDER BY installed_on DESC
LIMIT 5;
SQL

echo ""
echo -e "${GREEN}✓${NC} Latest migrations:"
echo ""

# Restore original .env
mv .env.backup.test .env

echo -e "${YELLOW}==================================================================================${NC}"
echo -e "${GREEN}✓ MIGRATION TEST COMPLETED SUCCESSFULLY${NC}"
echo -e "${YELLOW}==================================================================================${NC}"
echo ""
echo -e "${BLUE}Test Database Information:${NC}"
echo "  Name: $TEST_DB_NAME"
echo "  Host: $DB_HOST"
echo "  User: $DB_USER"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the test database if needed:"
echo "   ${BLUE}psql -h $DB_HOST -U $DB_USER -d $TEST_DB_NAME${NC}"
echo ""
echo "2. To clean up the test database:"
echo "   ${BLUE}PGPASSWORD=$DB_PASSWORD dropdb -h $DB_HOST -U $DB_USER $TEST_DB_NAME${NC}"
echo ""
echo "3. If satisfied, run migrations on production:"
echo "   ${BLUE}alembic upgrade head${NC}"
echo ""
echo -e "${YELLOW}⚠  IMPORTANT:${NC}"
echo "   - Your original database ($DB_NAME) was NOT modified"
echo "   - Manually drop the test database when no longer needed"
echo "   - Consider running 'seed.py' on production after migrations if needed"
echo ""
