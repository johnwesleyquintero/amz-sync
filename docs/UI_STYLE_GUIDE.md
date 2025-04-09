# UI Style Guide

This document outlines the core UI design patterns and requirements for Amazon Insights Sync to ensure consistency across the application.

## Spacing System

### Base Unit

- Base spacing unit: 4px (0.25rem)
- Use multiples of the base unit for consistent spacing

### Margin & Padding

#### Components

- Card padding: 16px (1rem)
- Section margin: 24px (1.5rem)
- Container padding: 20px (1.25rem)

#### Layout

- Grid gap: 16px (1rem)
- Content spacing: 32px (2rem)
- Sidebar padding: 16px (1rem)

### Responsive Spacing

- Mobile: reduce spacing by 25%
- Tablet: maintain default spacing
- Desktop: increase spacing by 25% where appropriate

## Typography

### Font Family

```css
--font-primary: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

## Containers

### Card Components

- Max width: 1200px
- Border radius: 8px
- Box shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`
- Background: `#ffffff`

### Layout Containers

- Content max-width: 1440px
- Sidebar width: 280px
- Tool container width: 100%
- Padding: 16px (1rem)

### Responsive Breakpoints

```css
--screen-sm: 640px;
--screen-md: 768px;
--screen-lg: 1024px;
--screen-xl: 1280px;
--screen-2xl: 1536px;
```

### Grid System

- Use CSS Grid for layout structure
- Column gap: 16px (1rem)
- Row gap: 24px (1.5rem)
- Default grid columns: 12

## Component-Specific Guidelines

### CSV Requirements Component

```tsx
<CsvRequirements
  requiredColumns={['date', 'product_id']}
  optionalColumns={['sales_rank', 'review_count']}
  maxFileSize="10MB"
/>
```

- Always place below main content section
- Use border-dashed styling for visual distinction
- Include required/optional columns as props
- Show sample CSV button as last element

### Tool Cards

- Consistent padding: 16px
- Title font size: 1.25rem (20px)
- Description font size: 0.875rem (14px)
- Action button padding: 8px 16px

### Navigation

- Nav item padding: 8px 12px
- Active state indicator: 2px border
- Hover state: Background opacity change

### Form Elements

- Input padding: 8px 12px
- Button padding: 8px 16px
- Form group margin: 16px
- Label margin-bottom: 4px

## Best Practices

1. Maintain consistent spacing using the base unit system
2. Use relative units (rem) for font sizes and spacing
3. Implement responsive design using the defined breakpoints
4. Follow the typography hierarchy for clear visual hierarchy
5. Apply container guidelines for consistent layout structure

## Implementation Notes

- Use Tailwind CSS utility classes when possible
- Maintain consistent component structure across the application
- Follow accessibility guidelines for text contrast and spacing
- Test layouts across all breakpoints for responsive design
