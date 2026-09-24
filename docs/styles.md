# Styles

## Design Tokens

### Naming Convention

```text
--<prefix>-<scope>-<property>-<modifier?>
```

- **prefix** - namespace (`ma`).
- **scope** - what the token belongs to (`base`, `button`, `input`, `card`, `modal`).
- **property** - what it controls (`background`, `color`, `padding`, `radius`, `shadow`).
- **modifier** _(optional)_ - additional context such as state, variant, size, or theme (`hover`, `focus`, `primary`, `sm`, `dark`).

Examples:

```text
--ma-base-color-primary
--ma-button-background-hover
--ma-input-border-focus
```

### Base Tokens

**Base tokens** (`--ma-base-*`) are the foundation of the design system. They represent reusable values such as colors, spacing, typography, shadows, and radii. They may be used directly in components or aliased through component tokens when customization is desired.

### Component Tokens

**Component tokens** (`--ma-button-*`, `--ma-input-*`, etc.) represent customization points for a specific component. Use them when a value needs to be customized by component state, variant, size, or theme.
