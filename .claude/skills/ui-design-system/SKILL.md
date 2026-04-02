---
name: ui-design-system
description: This skill should be used when implementing UI layouts, animations, or making design decisions. Provides structured guidance for consistent UI patterns.
triggers:
  - layout
  - animation
  - motion
  - design
  - ui pattern
  - landing page
  - dashboard
  - hero section
  - stagger
  - parallax
---

# UI Design System Skill

This skill provides structured guidance for UI layout patterns, animation timing, component recipes, and design tokens. Use this when implementing visual interfaces to ensure consistency.

## Data Files

The skill includes JSON data files for programmatic access:

| File | Purpose |
|------|---------|
| `data/animation-timing.json` | Duration, easing, and stagger values |
| `data/layout-patterns.json` | Page layouts by type (landing, dashboard, form) |
| `data/component-recipes.json` | Pre-built component + motion combinations |
| `data/design-tokens.json` | Spacing, typography, elevation tokens |

## Quick Reference

### Motion Components

| Component | Use Case | Import |
|-----------|----------|--------|
| `MotionReveal` | Reveal on scroll | `@/shared/components/motion-reveal` |
| `MotionStagger` | Staggered children | `@/shared/components/motion-stagger` |
| `MotionPresence` | Exit animations | `@/shared/components/motion-presence` |
| `MotionScroll` | Scroll-linked animation | `@/shared/components/motion-scroll` |
| `MotionText` | Text reveal effects | `@/shared/components/motion-text` |
| `MotionParallax` | Parallax scrolling | `@/shared/components/motion-scroll` |

### Animation Timing Decision Tree

```
What type of element?
├── Micro-interaction (button, toggle, checkbox)
│   → duration: micro (150ms), easing: spring
├── Tooltip/Dropdown
│   → duration: fast (200ms), easing: easeOut
├── Modal/Card
│   → duration: normal (300ms), easing: easeOut
├── Hero/Feature section
│   → duration: slow (500ms), easing: easeOut
└── Page transition
    → duration: slower (800ms), easing: easeInOut
```

### Page Layout Decision Tree

```
What type of page?
├── Landing/Marketing
│   → Hero (fadeInUp) + Features (stagger) + CTA (fadeIn)
├── Dashboard
│   → Sidebar layout + Widgets (stagger)
├── Form
│   → Centered single-column + fadeInUp per field
├── List/Collection
│   → Cards grid (staggerContainer) or Table (fadeIn)
├── Detail page
│   → Single column with staggered sections
└── Auth (login/register)
    → Centered minimal with scaleIn
```

## Usage Patterns

### 1. Landing Page Hero

```tsx
import { MotionReveal } from "@/shared/components/motion-reveal";
import { MotionText } from "@/shared/components/motion-text";

function HeroSection() {
  return (
    <Box minH="100vh" display="flex" alignItems="center" py={{ base: 24, md: 32 }}>
      <Container maxW="container.xl">
        <VStack gap={6}>
          <Heading size={{ base: "4xl", md: "5xl", lg: "6xl" }}>
            <MotionText as="h1" mode="words" staggerDelay={0.05}>
              Build Amazing Products
            </MotionText>
          </Heading>

          <MotionReveal variant="fadeInUp" delay={0.3}>
            <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted">
              Your compelling subtitle goes here
            </Text>
          </MotionReveal>

          <MotionReveal variant="fadeInUp" delay={0.5}>
            <Button colorPalette="brand" size="lg">Get Started</Button>
          </MotionReveal>
        </VStack>
      </Container>
    </Box>
  );
}
```

### 2. Feature Cards Grid

```tsx
import { MotionStagger } from "@/shared/components/motion-stagger";

function FeaturesSection({ features }) {
  return (
    <Box py={{ base: 16, md: 24 }}>
      <Container maxW="container.xl">
        <MotionStagger
          itemVariant="scaleInUp"
          staggerDelay={0.1}
          as="div"
        >
          {features.map((feature) => (
            <Card.Root key={feature.id} shadow="sm" _hover={{ shadow: "lg" }}>
              <Card.Body>
                <VStack gap={4}>
                  <Icon as={feature.icon} boxSize={8} color="brand.500" />
                  <Heading size="md">{feature.title}</Heading>
                  <Text color="fg.muted">{feature.description}</Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </MotionStagger>
      </Container>
    </Box>
  );
}
```

### 3. Dashboard Widget Grid

```tsx
import { MotionStagger } from "@/shared/components/motion-stagger";

function DashboardWidgets({ widgets }) {
  return (
    <Box p={{ base: 4, md: 6 }}>
      <MotionStagger
        staggerDelay="fast"
        itemVariant="fadeInUp"
      >
        {widgets.map((widget) => (
          <Card.Root key={widget.id}>
            <Card.Body>{widget.content}</Card.Body>
          </Card.Root>
        ))}
      </MotionStagger>
    </Box>
  );
}
```

### 4. Tab Content Transitions

```tsx
import { MotionPresence } from "@/shared/components/motion-presence";
import { MotionReveal } from "@/shared/components/motion-reveal";

function TabContent({ activeTab, content }) {
  return (
    <MotionPresence mode="wait">
      <MotionReveal key={activeTab} variant="slideInRight">
        {content}
      </MotionReveal>
    </MotionPresence>
  );
}
```

### 5. Parallax Background

```tsx
import { MotionParallax } from "@/shared/components/motion-scroll";

function ParallaxSection() {
  return (
    <Box position="relative" overflow="hidden">
      <MotionParallax speed={0.5}>
        <Image
          src="/background.jpg"
          alt=""
          position="absolute"
          inset={0}
          objectFit="cover"
        />
      </MotionParallax>
      <Box position="relative" zIndex={1}>
        {/* Content */}
      </Box>
    </Box>
  );
}
```

### 6. Scroll-Linked Animation

```tsx
import { MotionScroll } from "@/shared/components/motion-scroll";

function ScrollRevealSection() {
  return (
    <MotionScroll
      style={{
        opacity: [0, 1],
        scale: [0.9, 1],
        y: [50, 0],
      }}
    >
      <Card.Root>
        <Card.Body>Content that animates based on scroll</Card.Body>
      </Card.Root>
    </MotionScroll>
  );
}
```

## Variant Reference

### Available Presets

| Variant | Effect | Use Case |
|---------|--------|----------|
| `fadeIn` | Opacity only | Subtle reveals |
| `fadeInUp` | Opacity + slide up | Default for most content |
| `fadeInDown` | Opacity + slide down | Dropdowns, menus |
| `fadeInLeft` | Opacity + slide from left | Side navigation |
| `fadeInRight` | Opacity + slide from right | Side panels |
| `scaleIn` | Opacity + scale | Modals, cards |
| `scaleInUp` | Opacity + scale + slide up | Feature cards |
| `slideInLeft` | Large slide from left | Page transitions |
| `slideInRight` | Large slide from right | Page transitions |
| `bounceIn` | Spring bounce | Playful elements |
| `bounceInUp` | Spring bounce + slide up | Notifications |
| `flipInX` | 3D rotation X | Cards, special reveals |
| `flipInY` | 3D rotation Y | Cards, special reveals |

## Anti-Patterns

1. **Avoid excessive animation** - Not everything needs to animate
2. **Avoid competing animations** - Don't animate parent and children simultaneously
3. **Avoid long durations** - Keep most animations under 500ms
4. **Avoid animation on data tables** - Simple fade is sufficient
5. **Always respect reduced motion** - Components handle this automatically
6. **Don't animate text in forms** - Keep form fields static
7. **Avoid stagger on more than 10-15 items** - Use fast stagger or fade only

## Reduced Motion

All motion components automatically respect `prefers-reduced-motion`. When enabled:
- Animations reduce to simple opacity fade
- Duration reduces to 150ms (micro)
- Transforms are removed

No additional code needed - this is handled by the components.
