# Project Reorganization Plan

## Current Structure Issues

1. **Too many documentation files in root** (16 files)
2. **Scripts scattered** (setup.ps1, check-health.ps1 in root)
3. **No dedicated scripts folder**
4. **No testing structure**
5. **No deployment configuration**
6. **No logs folder**

## Proposed Clean Structure

```
export-contract-generator/
│
├── .github/                          # GitHub-specific files
│   ├── copilot-instructions.md       # AI agent instructions
│   └── workflows/                    # CI/CD pipelines (future)
│
├── client/                           # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   ├── constants/
│   │   ├── utils/                    # NEW: Frontend utilities
│   │   └── styles/                   # NEW: Global styles organized
│   ├── .env
│   └── package.json
│
├── server/                           # Backend (Node.js/Express)
│   ├── config/                       # Configuration
│   │   ├── db.js
│   │   └── constants.js              # NEW: Server constants
│   ├── models/                       # Mongoose schemas
│   ├── routes/                       # API routes
│   ├── controllers/                  # NEW: Business logic separated
│   ├── middleware/                   # NEW: Auth, validation, etc.
│   ├── utils/                        # Utilities
│   ├── validators/                   # NEW: Input validation schemas
│   ├── tests/                        # NEW: Backend tests
│   ├── server.js
│   └── seed.js
│
├── scripts/                          # NEW: All scripts centralized
│   ├── setup.ps1                     # Moved from root
│   ├── check-health.ps1              # Moved from root
│   ├── seed-database.ps1             # NEW
│   ├── backup-database.ps1           # NEW
│   └── deploy.ps1                    # NEW
│
├── docs/                             # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── user-guides/                  # NEW: Organized guides
│   │   ├── QUICKSTART.md             # Moved
│   │   ├── USER_GUIDE.md             # Moved
│   │   └── MONGODB_INSTALL.md        # Moved
│   ├── setup-guides/                 # NEW: Setup documentation
│   │   └── SETUP_GUIDE.md            # Moved
│   └── development/                  # NEW: Dev documentation
│       ├── FEATURES.md               # Moved
│       ├── PROJECT_SUMMARY.md        # Moved
│       └── CONTRIBUTING.md           # NEW
│
├── tests/                            # NEW: Integration/E2E tests
│   ├── integration/
│   └── e2e/
│
├── logs/                             # NEW: Application logs
│   ├── .gitkeep
│   └── .gitignore
│
├── uploads/                          # NEW: File uploads (future)
│   └── .gitignore
│
├── backups/                          # NEW: Database backups
│   └── .gitignore
│
├── config/                           # NEW: Environment configs
│   ├── development.env.example
│   ├── production.env.example
│   └── test.env.example
│
├── .env                              # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md                         # Main documentation entry point
```

## Migration Steps

### Phase 1: Create New Directories (No Breaking Changes)
```powershell
# Create new folder structure
New-Item -ItemType Directory -Path "scripts"
New-Item -ItemType Directory -Path "server/controllers"
New-Item -ItemType Directory -Path "server/middleware"
New-Item -ItemType Directory -Path "server/validators"
New-Item -ItemType Directory -Path "server/tests"
New-Item -ItemType Directory -Path "tests/integration"
New-Item -ItemType Directory -Path "tests/e2e"
New-Item -ItemType Directory -Path "logs"
New-Item -ItemType Directory -Path "uploads"
New-Item -ItemType Directory -Path "backups"
New-Item -ItemType Directory -Path "config"
New-Item -ItemType Directory -Path "docs/user-guides"
New-Item -ItemType Directory -Path "docs/setup-guides"
New-Item -ItemType Directory -Path "docs/development"
New-Item -ItemType Directory -Path "client/src/utils"
New-Item -ItemType Directory -Path "client/src/styles"
```

### Phase 2: Move Documentation Files
```powershell
# Move user guides
Move-Item "QUICKSTART.md" "docs/user-guides/"
Move-Item "QUICK_START.md" "docs/user-guides/"  # Consolidate with QUICKSTART
Move-Item "USER_GUIDE.md" "docs/user-guides/"
Move-Item "MONGODB_INSTALL.md" "docs/user-guides/"

# Move setup guides
Move-Item "SETUP_GUIDE.md" "docs/setup-guides/"

# Move development docs
Move-Item "FEATURES.md" "docs/development/"
Move-Item "PROJECT_SUMMARY.md" "docs/development/"

# Keep setup.log in root temporarily (can delete after verification)
```

### Phase 3: Move Scripts
```powershell
Move-Item "setup.ps1" "scripts/"
Move-Item "check-health.ps1" "scripts/"
# Update any references to these scripts in documentation
```

### Phase 4: Refactor Server Code (Controller Pattern)

**Example: Extract contracts controller**

Create `server/controllers/contractController.js`:
```javascript
// Business logic separated from routes
const Contract = require('../models/Contract');
const { validateContractData } = require('../utils/calculations');

exports.getAllContracts = async (req, res) => {
  // Logic here
};

exports.createContract = async (req, res) => {
  // Logic here
};
// ... more controller methods
```

Update `server/routes/contracts.js`:
```javascript
const router = require('express').Router();
const contractController = require('../controllers/contractController');

router.get('/', contractController.getAllContracts);
router.post('/', contractController.createContract);
// ... cleaner routes
```

### Phase 5: Add Middleware Structure
```powershell
# Create common middleware files
New-Item -ItemType File -Path "server/middleware/errorHandler.js"
New-Item -ItemType File -Path "server/middleware/validateRequest.js"
New-Item -ItemType File -Path "server/middleware/auth.js"  # For future
```

### Phase 6: Add Testing Structure
```powershell
# Backend unit tests
New-Item -ItemType File -Path "server/tests/calculations.test.js"
New-Item -ItemType File -Path "server/tests/models.test.js"

# Integration tests
New-Item -ItemType File -Path "tests/integration/contracts.test.js"

# Add test scripts to package.json
```

### Phase 7: Environment Configuration
```powershell
# Split environment configs
Copy-Item ".env.example" "config/development.env.example"
Copy-Item ".env.example" "config/production.env.example"
New-Item -ItemType File -Path "config/test.env.example"
```

### Phase 8: Add .gitignore Entries
```
# logs/
logs/*.log
!logs/.gitkeep

# uploads/
uploads/*
!uploads/.gitkeep

# backups/
backups/*
!backups/.gitkeep

# Environment
.env
.env.local
.env.development
.env.production
```

## Benefits of Reorganization

### 1. **Cleaner Root Directory**
- Only essential files (README, package.json, .gitignore, .env)
- Easier to navigate
- Professional appearance

### 2. **Organized Documentation**
- User guides separate from dev docs
- Easier to find specific documentation
- Better for new developers

### 3. **Scalability**
- Controller pattern allows easier feature additions
- Middleware structure supports authentication, logging
- Testing structure ready for CI/CD

### 4. **Maintainability**
- Clear separation of concerns
- Easier to locate files
- Logical grouping

### 5. **Production Ready**
- Proper logging structure
- Backup system ready
- Environment-specific configs

## Breaking Changes & Mitigation

### Scripts Location Change
**Impact**: Documentation references to scripts
**Mitigation**: Update all `.md` files with new paths

### No Code Breaking Changes
**Impact**: None - folder structure changes don't affect imports
**Reason**: Node.js requires use relative paths, moving files breaks nothing if updated properly

## Rollback Plan

All changes are non-destructive file moves. Git can revert:
```powershell
git checkout -- .
```

Or manually move files back using same PowerShell commands.

## Timeline

- **Phase 1-3**: 30 minutes (safe moves)
- **Phase 4-5**: 2-3 hours (refactoring)
- **Phase 6-7**: 1-2 hours (new features)
- **Phase 8**: 15 minutes (config)

**Total**: ~4-6 hours for complete reorganization

## Priority Levels

### High Priority (Do First)
1. Create folder structure
2. Move documentation files
3. Move scripts
4. Update documentation references

### Medium Priority (Do Soon)
1. Controller pattern refactoring
2. Middleware structure
3. Testing structure

### Low Priority (Future Enhancement)
1. Uploads folder implementation
2. Backup automation
3. CI/CD pipeline
