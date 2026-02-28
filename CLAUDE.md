# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ServiceNow Fluent SDK project that uses TypeScript DSL to define ServiceNow platform artifacts (tables, records, catalog items, variable sets, etc.). The code compiles to ServiceNow XML update sets via the `now-sdk` CLI.

## Common Commands

- **Build the project**: `npm run build` (runs `now-sdk build`)
- **Deploy to ServiceNow**: `npm run deploy` (runs `now-sdk install`)
- **Transform code**: `npm run transform` (runs `now-sdk transform`)
- **Manage types**: `npm run types` (runs `now-sdk dependencies`)
- **Lint**: `npx eslint src/`

## Architecture

### Fluent DSL Patterns

All ServiceNow artifacts are defined using function-based DSL patterns from `@servicenow/sdk/core`:

**File Naming**: All Fluent source files must end with `.now.ts` (e.g., `index.now.ts`, `table-definitions.now.ts`).

**Table Definitions**:
```typescript
import { Table, StringColumn, IntegerColumn } from '@servicenow/sdk/core'

export const x_scope_tablename = Table({
    name: 'x_scope_tablename',
    label: 'Table Label',
    schema: {
        field_name: StringColumn({ label: 'Field Label', mandatory: true }),
    },
})
```

**Record Definitions**:
```typescript
import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['record-id'],
    table: 'incident',
    data: {
        short_description: 'Sample incident',
        priority: '3',
    },
})
```

**Catalog Items & Variable Sets**:
```typescript
import { VariableSet, CatalogItemRecordProducer, RichTextLabelVariable } from '@servicenow/sdk/core'

const varSet = VariableSet({
    $id: 'variable_set_id',
    title: 'Variable Set Title',
    internalName: 'internal_name',
    type: 'singleRow',
    order: 100,
    version: 2,
    variables: {
        var_name: RichTextLabelVariable({
            order: 100,
            richText: '<p>HTML content</p>',
        }),
    },
})

CatalogItemRecordProducer({
    $id: Now.ID['producer_id'],
    name: 'Record Producer Name',
    table: 'incident',
    variableSets: [{ variableSet: varSet, order: 100 }],
    version: 2,
})
```

### ID Management & Generated Keys

The `$id` property is used for referencing records:
- Use `Now.ID['identifier']` for records that need stable references
- Use string literals (e.g., `$id: 'contact_info_set'`) for simple cases

All IDs are tracked in `src/fluent/generated/keys.ts`. This file maps Fluent identifiers to ServiceNow sys_ids and should not be manually edited. It contains:
- `explicit` keys: Direct ID mappings for top-level records
- `composite` keys: Related records (fx_price, io_set_item, etc.)

### TypeScript Configuration

The project uses a project references setup:
- `src/fluent/tsconfig.json` - Root configuration with references
- `src/fluent/tsconfig.server.json` - Server-side scripts (ES2021, no modules)
- `src/fluent/tsconfig.client.json` - Client-side scripts (ES6, DOM libs)

Server-side code runs in ServiceNow's Rhino environment and should not use ES modules or modern browser APIs.

### Build Output

Running `npm run build` generates:
- `dist/app/scope/sys_app_*.xml` - App scope definition
- `dist/app/update/*.xml` - Individual update sets for each artifact
- `target/*.zip` - Deployment package

### Scope Configuration

App scope is defined in `now.config.json`:
```json
{
    "scope": "x_820676_sdk_flow",
    "scopeId": "82f851f3626f4eba9ef578f497c8828c",
    "name": "sdk-flow-cat-item"
}
```

## ESLint Rules

The project uses `@servicenow/eslint-plugin-sdk-app-plugin` with the `recommended` config. This enforces ServiceNow-specific best practices for the Fluent SDK.

## VS Code Extension

Install the ServiceNow Fluent Language Extension (`servicenow.fluent-language-extension`) for syntax highlighting and IntelliSense support.

## Important Notes

- Always increment `version` when modifying existing artifacts
- Do not manually edit files in `src/fluent/generated/`
- Do not commit `node_modules/` or `dist/` (they are gitignored)
- The Flow Designer flow is defined separately in `Flow_CatFact_Incident_Automation.json` and must be manually imported/configured in ServiceNow (see `Setup_Instructions.md`)
