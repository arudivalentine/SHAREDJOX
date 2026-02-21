# Design System Components

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Background | #0A0A0F | Page background |
| Surface | #1A1A2E | Card/container backgrounds |
| Cyan | #00F0FF | AI actions, primary CTAs |
| Violet | #8B5CF6 | Human actions, secondary CTAs |
| Success | #10B981 | Confirmations, positive states |
| Warning | #F59E0B | Cautions, pending states |
| Error | #EF4444 | Errors, destructive actions |

## Components

### GlassCard

Glassmorphic container with optional glow effect.

```tsx
<GlassCard glow="cyan" interactive>
  <h3>Card Title</h3>
  <p>Content here</p>
</GlassCard>
```

**Props:**
- `glow`: 'cyan' | 'violet' | 'none' (default: 'none')
- `interactive`: boolean (adds hover glow effect)
- `children`: ReactNode

### AnimatedButton

Button with spring animations and loading state.

```tsx
<AnimatedButton 
  variant="primary" 
  size="lg" 
  loading={isLoading}
  onClick={handleClick}
>
  Click Me
</AnimatedButton>
```

**Variants:** primary | secondary | ghost | danger
**Sizes:** sm | md | lg

### SkeletonScreen

Shimmer loading placeholder.

```tsx
<SkeletonScreen variant="text" lines={3} />
<SkeletonScreen variant="card" />
<SkeletonScreen variant="avatar" />
```

**Variants:** text | card | avatar

### MatchBadge

Displays match percentage with color-coded indicator.

```tsx
<MatchBadge 
  percentage={87} 
  label="match"
  showExplainer
  explainerText="React + your rate fits"
/>
```

**Props:**
- `percentage`: number (0-100)
- `label`: string (optional)
- `size`: 'sm' | 'md' | 'lg'
- `showExplainer`: boolean
- `explainerText`: string

## Animation Standards

- **Page transitions**: 300ms ease-out
- **Micro-interactions**: 150ms spring (stiffness: 400, damping: 25)
- **Loading states**: Shimmer with 2s cycle
- **Success states**: Scale(1.02) + color shift

## Typography

- **UI Font**: Inter
- **Code Font**: JetBrains Mono
- **Sizes**: xs (12px) → 3xl (32px)
- **Weights**: normal (400) → bold (700)
