# Steering Files Overview

This directory contains steering files that provide context and guidance for working with the Export Contract Generator project.

## What are Steering Files?

Steering files are markdown documents that provide additional context, standards, and best practices to AI assistants (like Kiro) when working on your codebase. They help ensure consistent code quality and adherence to project patterns.

## Inclusion Types

### Auto-Included (Always Active)
These files are automatically included in every AI interaction:
- `project-overview.md` - High-level project information
- `coding-standards.md` - Code style and best practices
- `common-tasks.md` - Frequently used commands and workflows

### File-Match (Context-Aware)
These files are included when working with specific file types:
- `api-reference.md` - Included when editing route files
- `database-models.md` - Included when editing model files
- `react-patterns.md` - Included when editing React components
- `calculations.md` - Included when editing calculation utilities

### Manual (On-Demand)
These files are included only when explicitly referenced:
- `testing.md` - Testing guidelines and checklists
- `deployment.md` - Deployment procedures and configuration

## File Descriptions

### project-overview.md
- Project purpose and goals
- Technology stack summary
- Key features overview
- Development workflow basics

### coding-standards.md
- JavaScript/Node.js style guide
- React component patterns
- MongoDB/Mongoose best practices
- Error handling conventions
- Git commit standards

### api-reference.md
- REST API endpoint patterns
- Request/response formats
- Common route implementations
- Middleware usage
- Query optimization tips

### database-models.md
- Complete schema reference for all 5 models
- Relationship diagrams
- Validation rules
- Common Mongoose patterns
- Index recommendations

### react-patterns.md
- Component architecture
- State management patterns
- API integration examples
- Form handling
- Performance optimization

### calculations.md
- Core calculation formulas
- Tolerance range logic
- Number-to-text conversion
- Currency handling

### common-tasks.md
- Starting the application
- Database operations
- Adding new features
- Troubleshooting guide
- File location reference

### testing.md
- Running tests
- Test structure examples
- Manual testing checklists

### deployment.md
- Environment configuration
- AWS deployment steps
- Production setup

## How to Use

### For Developers
Reference these files when:
- Starting work on the project
- Adding new features
- Following coding standards
- Troubleshooting issues

### For AI Assistants
These files are automatically loaded based on:
- The type of file being edited
- The task being performed
- Explicit references in prompts

## Customization

You can modify these files to:
- Add project-specific patterns
- Update coding standards
- Document new features
- Add troubleshooting steps

## File Match Patterns

The `fileMatchPattern` in frontmatter determines when files are included:
- `**/routes/*.js` - Any route file
- `**/models/*.js` - Any model file
- `**/components/*.js` - Any React component
- `**/utils/calculations.js` - Specific calculation file

## Best Practices

1. Keep steering files up-to-date with project changes
2. Use clear, concise language
3. Include code examples for patterns
4. Document common pitfalls and solutions
5. Reference actual project files and patterns
