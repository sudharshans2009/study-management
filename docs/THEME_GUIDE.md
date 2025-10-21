# Theme System Guide

## Overview

SS.Study uses a modern, minimal design system built with next-themes for seamless theme switching between light, dark, and system modes. The design maintains the original OKLCH color variables while adding smooth transitions and enhanced visual hierarchy.

## Color System

### Color Format
We use OKLCH (Oklab Color Space) for our color variables, providing:
- Perceptually uniform colors
- Better color manipulation
- Improved accessibility
- Consistent brightness across hues

### Light Mode
```css
--background: oklch(1 0 0);           /* Pure white */
--foreground: oklch(0.141 0.005 285.823); /* Dark text */
--primary: oklch(0.488 0.243 264.376);    /* Brand blue */
--card: oklch(1 0 0);                     /* White cards */
--border: oklch(0.92 0.004 286.32);       /* Subtle borders */
```

### Dark Mode
```css
--background: oklch(0.141 0.005 285.823); /* Deep background */
--foreground: oklch(0.985 0 0);           /* Light text */
--primary: oklch(0.488 0.243 264.376);    /* Brand blue */
--card: oklch(0.21 0.006 285.885);        /* Elevated cards */
--border: oklch(1 0 0 / 10%);             /* Subtle borders */
```

## Typography

### Fonts
- **Sans Serif**: Geist Sans (Primary)
- **Monospace**: Geist Mono (Code & technical content)

### Font Variables
```css
--font-sans: var(--font-geist-sans);
--font-mono: var(--font-geist-mono);
```

### Font Features
```css
font-feature-settings: "rlig" 1, "calt" 1;
```
Enables contextual ligatures and contextual alternates for better readability.

## Theme Switching

### Implementation
The theme system uses next-themes with three modes:
1. **Light**: Explicit light mode
2. **Dark**: Explicit dark mode  
3. **System**: Follows OS preference

### Usage
```tsx
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme("dark")}>
      Switch to dark mode
    </button>
  );
}
```

### Theme Provider Setup
```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

## Components

### ThemeToggle Component
Location: `components/theme-toggle.tsx`

Features:
- Sun/Moon/Monitor icons
- Dropdown menu with all three modes
- Visual checkmark for active theme
- Smooth icon transitions
- SSR-safe mounting check

### Theme-Aware Components
All ShadCn components automatically support theming via CSS variables:
- Buttons
- Cards
- Forms
- Dialogs
- Dropdowns
- Navigation
- Alerts

## Design Principles

### 1. Minimal & Clean
- Reduced border radius (0.65rem)
- Ample whitespace
- Clear visual hierarchy
- Subtle shadows

### 2. Smooth Transitions
All color changes use:
```css
transition-colors duration-200
```

### 3. Accessibility
- WCAG AA compliant contrast ratios
- Focus indicators on all interactive elements
- Keyboard navigation support
- Screen reader friendly

### 4. Consistency
- All components use CSS variables
- Uniform spacing scale
- Consistent hover/active states
- Predictable behavior

## Layout Components

### Navbar
- Sticky positioning
- Backdrop blur effect: `bg-background/80 backdrop-blur-md`
- Increased spacing: `space-x-8` for navigation
- Theme toggle integrated next to user menu

### Logo
- Contained icon with primary background
- Rounded container with shadow
- Smooth hover opacity transition

### Navigation Links
**Desktop:**
- Bottom border on active state
- Smooth color transitions
- Hover state changes text color

**Mobile:**
- Primary background for active state
- Accent background for hover
- Icon + label layout

## Auth Pages

### Features
- Centered layout with max-width
- Card-based forms with shadow
- Improved spacing (p-8)
- Clear visual hierarchy
- Dark mode optimized alerts

### Example Structure
```tsx
<div className="bg-card border rounded-lg shadow-sm p-8">
  {/* Auth form content */}
</div>
```

## Best Practices

### 1. Always Use CSS Variables
```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Bad  
<div className="bg-white text-black">
```

### 2. Leverage Tailwind Utilities
```tsx
// ✅ Good
<div className="bg-card border rounded-lg shadow-sm">

// ❌ Bad (inline styles)
<div style={{ backgroundColor: 'white', border: '1px solid' }}>
```

### 3. Test Both Themes
Always verify components in both light and dark modes:
- Use ThemeToggle to switch
- Check contrast ratios
- Verify all states (hover, active, disabled)

### 4. Smooth Transitions
Add transitions to interactive elements:
```tsx
<button className="transition-all hover:scale-105">
  Click me
</button>
```

## Common Patterns

### Card with Shadow
```tsx
<div className="bg-card border rounded-lg shadow-sm p-6">
  <h3 className="font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Active Navigation Link
```tsx
<Link
  className={cn(
    "transition-all relative",
    isActive
      ? "text-foreground after:absolute after:bottom-0 after:h-0.5 after:bg-primary"
      : "text-muted-foreground hover:text-foreground"
  )}
>
  Link
</Link>
```

### Icon Container
```tsx
<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground shadow-sm">
  <Icon className="h-5 w-5" />
</div>
```

## Troubleshooting

### Flash of Unstyled Content (FOUC)
Add `suppressHydrationWarning` to html element:
```tsx
<html lang="en" suppressHydrationWarning>
```

### Theme Not Persisting
Check that ThemeProvider has `enableSystem` and proper `attribute`:
```tsx
<ThemeProvider attribute="class" enableSystem>
```

### Colors Not Updating
Ensure all color references use CSS variables, not hardcoded values.

### SSR Issues
Use mounted state in theme-dependent components:
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

## Resources

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [ShadCn UI](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [OKLCH Color Space](https://oklch.com/)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

## Updates & Maintenance

### Adding New Colors
1. Define in both `:root` and `.dark` selectors
2. Add to `@theme inline` mapping
3. Test in both themes
4. Document usage

### Modifying Existing Colors
1. Update OKLCH values carefully
2. Maintain contrast ratios
3. Test all components
4. Update documentation

---

**Last Updated:** October 2025  
**Version:** 1.0.0  
**Maintainer:** SS.Study Team
