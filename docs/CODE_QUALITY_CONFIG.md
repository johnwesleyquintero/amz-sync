# Code Quality Configuration Guide

## Overview

The Code Quality Framework now supports parallel execution and error categorization through a JSON configuration file. This guide explains how to configure and use these features effectively.

## Configuration File

Create a `.code-quality.json` file in your project root with the following structure:

```json
{
  "parallel": true,
  "commands": ["npm run format", "npm run lint", "npx tsc --noEmit", "npm run build"],
  "errorCategories": {
    "style": {
      "patterns": ["style.*rule", "prettier", "eslint"],
      "suggestion": "Review code style guidelines and formatting rules"
    }
  }
}
```

### Configuration Options

#### Parallel Execution

Set `parallel` to `true` to run commands concurrently, improving performance on multi-core systems. Set to `false` for sequential execution.

#### Commands

Specify an array of commands to run as part of the quality checks. These commands typically include:

- Formatting (`npm run format`)
- Linting (`npm run lint`)
- Type checking (`npx tsc --noEmit`)
- Building (`npm run build`)

#### Error Categories

Define categories to group and classify errors based on patterns. Each category includes:

- `patterns`: Array of regex patterns to match against error messages
- `suggestion`: Helpful message displayed when errors in this category occur

### Example Categories

```json
{
  "errorCategories": {
    "style": {
      "patterns": ["style.*rule", "prettier", "eslint"],
      "suggestion": "Review code style guidelines and formatting rules"
    },
    "types": {
      "patterns": ["TS\\d+", "type.*error"],
      "suggestion": "Fix type inconsistencies and add missing type annotations"
    },
    "build": {
      "patterns": ["build.*failed", "webpack", "vite"],
      "suggestion": "Check build configuration and resolve compilation errors"
    }
  }
}
```

## Best Practices

1. **Parallel Execution**

   - Enable parallel execution on CI/CD pipelines to reduce build times
   - Consider disabling parallel execution locally if you need sequential error output

2. **Error Categories**

   - Create specific categories for common error types in your project
   - Use precise regex patterns to avoid miscategorization
   - Provide actionable suggestions that guide developers to solutions

3. **Command Organization**
   - List commands in order of dependency (e.g., formatting before linting)
   - Include all critical quality checks your project requires
   - Ensure commands exit with appropriate status codes

## Integration

1. Add the configuration file to your project:

   ```bash
   touch .code-quality.json
   ```

2. Configure your CI/CD pipeline to use the enhanced framework:

   ```yaml
   - name: Code Quality Checks
     run: npm run cq
   ```

3. Update your documentation to reference the new configuration options

## Troubleshooting

- If parallel execution causes issues, try disabling it temporarily
- Verify regex patterns match your error messages correctly
- Ensure all commands are properly configured in package.json
