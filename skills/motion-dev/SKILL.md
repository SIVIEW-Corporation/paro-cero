---
name: motion-dev
description: >
  Specialist in React-based animations using Motion v12 (formerly Framer Motion).
  Trigger: When adding animations, gestures, layout transitions, or using 'motion/react' components.
license: Apache-2.0
metadata:
  author: Purple-Code-sh
  version: '1.0'
  auto_invoke:
    - 'Adding animations to components'
    - 'Implementing page transitions'
    - 'Handling gestures (drag, hover, pan)'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## When to Use

Use this skill when:

- Adding animations to React components.
- Implementing complex gestures (drag, tap, pan).
- Creating shared layout transitions (`layoutId`).
- Orchestrating staggered animations with variants.
- Using `motion/react` or `motion/react-client`.

---

## Critical Patterns

### 1. Motion Imports (v12)

Use the correct entry points for Motion v12.

```typescript
// ✅ Correct (General)
import { motion, AnimatePresence } from 'motion/react';

// ✅ Correct (Client-only / React Server Components compat)
import * as motion from 'motion/react-client';
```

### 2. Declarative Animations

Drive animations with props, state, or variants.

```tsx
// ✅ Correct: Declarative
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />

// ✅ Correct: Variants (Clean & Orchestrated)
const variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

<motion.div variants={variants} initial="hidden" animate="visible" />
```

### 3. Layout Transitions

Use `layout` prop for automatic layout animations.

```tsx
// ✅ Automatic layout animation
<motion.div layout transition={{ type: 'spring' }} />

// ✅ Shared element transition
<motion.div layoutId="unique-id" />
```

---

## Decision Tree

```
Simple state change? → `animate` prop
Complex sequence? → `variants`
Shared element between pages? → `layoutId`
List reordering? → `layout` prop
Scroll effects? → `useScroll` + `useTransform`
Leaving DOM? → `AnimatePresence` + `exit` prop
```

---

## Code Examples

### Example 1: Staggered List

```tsx
import { motion } from 'motion/react';

const list = {
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  hidden: { opacity: 0 },
};

const item = {
  visible: { opacity: 1, x: 0 },
  hidden: { opacity: 0, x: -20 },
};

export const List = ({ items }) => (
  <motion.ul initial="hidden" animate="visible" variants={list}>
    {items.map((it) => (
      <motion.li key={it.id} variants={item}>
        {it.text}
      </motion.li>
    ))}
  </motion.ul>
);
```

### Example 2: Client Component (Next.js)

```tsx
'use client';
import * as motion from 'motion/react-client';

export default function Card() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ background: 'white', padding: 20 }}
    >
      Click me
    </motion.div>
  );
}
```

---

## Commands

```bash
# Install Motion
npm install motion
```

---

## Resources

- **Official Docs**: [motion.dev](https://motion.dev)