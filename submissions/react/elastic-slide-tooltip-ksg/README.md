# ElasticSlideTooltip — React Component

A fully accessible React tooltip component that uses EaseMotion CSS utility classes
for a smooth **elastic-slide entrance animation**. Designed for responsive dashboard
layouts with support for all four placements, six color variants, configurable
delay/offset, keyboard dismissal, and ARIA roles out of the box.

---

## EaseMotion CSS classes used

| Class | Purpose |
|---|---|
| `ease-fade-in` | Opacity fade on tooltip entrance |
| `ease-slide-up` | Slide from below (top placement) |
| `ease-slide-down` | Slide from above (bottom placement) |
| `ease-slide-in-left` | Slide from left (right placement) |
| `ease-slide-in-right` | Slide from right (left placement) |
| `ease-shadow-lg` | Layered shadow depth token |
| `ease-hover-lift-shadow` | Dashboard card lift on hover |
| `ease-hover-grow` | Info button scale on hover |
| `ease-fade-in ease-delay-100…` | Staggered card entrance |

---

## Installation

```bash
# No additional packages required beyond React itself.
# Copy the two files into your project:
#   ElasticSlideTooltip.jsx
#   style.css
#
# Then make sure EaseMotion CSS is loaded in your app:
```

```html
<!-- In your index.html or root layout -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/easemotion-css/easemotion.css" />
```

---

## Usage

### Basic tooltip

```jsx
import ElasticSlideTooltip from './ElasticSlideTooltip';

function App() {
  return (
    <ElasticSlideTooltip content="This is a tooltip" placement="top">
      <button>Hover me</button>
    </ElasticSlideTooltip>
  );
}
```

### Dashboard demo (full grid)

```jsx
import { DashboardTooltipDemo } from './ElasticSlideTooltip';

function App() {
  return <DashboardTooltipDemo />;
}
```

### All placement variants

```jsx
<ElasticSlideTooltip content="Appears above" placement="top">
  <span>Top</span>
</ElasticSlideTooltip>

<ElasticSlideTooltip content="Appears below" placement="bottom" variant="primary">
  <span>Bottom</span>
</ElasticSlideTooltip>

<ElasticSlideTooltip content="Appears to the left" placement="left" variant="success">
  <span>Left</span>
</ElasticSlideTooltip>

<ElasticSlideTooltip content="Appears to the right" placement="right" variant="danger">
  <span>Right</span>
</ElasticSlideTooltip>
```

### Disabled state

```jsx
<ElasticSlideTooltip content="Never shows" disabled>
  <button>No tooltip here</button>
</ElasticSlideTooltip>
```

### Custom delay and offset

```jsx
<ElasticSlideTooltip
  content="Appears slowly, with more space"
  placement="top"
  delayShow={400}
  delayHide={200}
  offset={16}
>
  <span>Slow tooltip</span>
</ElasticSlideTooltip>
```

---

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | The trigger element (any focusable element works) |
| `content` | `string \| ReactNode` | **required** | Tooltip content — text or any JSX |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Preferred position relative to the trigger |
| `variant` | `'dark' \| 'light' \| 'primary' \| 'success' \| 'danger' \| 'warning'` | `'dark'` | Color scheme of the tooltip bubble |
| `delayShow` | `number` (ms) | `120` | Milliseconds before the tooltip appears |
| `delayHide` | `number` (ms) | `80` | Milliseconds before the tooltip disappears |
| `offset` | `number` (px) | `10` | Gap between the trigger edge and the tooltip bubble |
| `disabled` | `boolean` | `false` | When `true`, tooltip never appears |
| `className` | `string` | `''` | Additional CSS classes applied to the trigger wrapper |
| `maxWidth` | `string` | `'220px'` | CSS `max-width` of the tooltip bubble |

---

## Accessibility

- Tooltip bubble uses `role="tooltip"` per ARIA spec.
- Trigger wrapper uses `aria-describedby` pointing to the tooltip ID when visible.
- Tooltip is shown and hidden on both `mouseenter`/`mouseleave` (pointer) and
  `focus`/`blur` (keyboard navigation).
- Pressing `Escape` dismisses the tooltip.
- A `@media (prefers-reduced-motion: reduce)` guard in `style.css` disables all
  animations for users who have requested reduced motion.

---

## How the elastic-slide animation works

The tooltip bubble receives two EaseMotion CSS classes simultaneously on mount:

```jsx
className={[
  'elastic-tooltip-bubble',
  'ease-fade-in',      // ← opacity 0→1 in 300ms
  animClass,           // ← directional translate, e.g. ease-slide-up
  'ease-shadow-lg',
].join(' ')}
```

Both `ease-fade-in` and the directional class use the same `300ms` duration and
`cubic-bezier(0.4, 0, 0.2, 1)` easing from EaseMotion's token system, so they
animate in perfect sync — creating the "elastic slide" effect where the tooltip
simultaneously fades in and glides into position from the correct edge.

---

## File structure

```
submissions/react/elastic-slide-tooltip-ksg/
├── ElasticSlideTooltip.jsx   ← Component + DashboardTooltipDemo export
├── style.css                 ← Tooltip geometry, colors, dashboard layout
└── README.md                 ← This file
```

---

Submitted by **karrisanthoshigayatri** · Issue [#38626](https://github.com/SAPTARSHI-coder/EaseMotion-css/issues/38626)
