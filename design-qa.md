# Atlas course-map hero design QA

Date: 2026-08-07

## Selected reference

`Screenshot 2026-08-07 at 7.37.29 PM.png`

The selected direction connects the halftone ink pools into course-map regions
with quiet contour rings, dashed paths, and waypoints. The dictionary card is
attached to `Atlas¹` in the hero body rather than the header logo.

## Visual comparison

- Compared the selected reference and the implementation side by side at a
  1640 by 960 viewport.
- Preserved the approved deployed hero composition, typography, ink-field
  density, instrument edge, and cursor physics.
- Added two restrained route paths across the upper-right and lower field.
- Added contour rings only to larger pools, outside the primary copy area.
- Anchored the definition card directly below `Atlas¹` in the body copy. It is
  intentionally allowed to cover nearby copy while open.
- Added a small top-border notch that points back to the definition trigger.
- The card reveals from its top edge downward rather than rising into place.
- Kept the trigger at the surrounding paragraph weight and used an underline
  as its only persistent emphasis.
- Kept the Atlas header logo unchanged.

## Interaction and accessibility

- Hover opens the definition card and pointer exit closes it.
- Click pins the card; outside click and Escape close it.
- Keyboard activation opens the card and Escape returns focus to the trigger.
- The trigger is a native button with `aria-expanded` and `aria-controls`.
- The card uses `role="definition"` and keeps `aria-hidden` synchronized.
- Touch uses the same click disclosure without relying on hover.

## Responsive and motion checks

- Desktop: 1640 by 960, passed.
- Mobile: 390 by 844, passed with no horizontal overflow.
- Mobile card becomes a contained fixed disclosure at the bottom edge.
- Reduced-motion styling removes transition duration, while the field's
  existing reduced-motion path renders a still map frame.
- Browser console: no errors.

## Verification

- `node --check field.js`
- `node --check definition.js`
- `git diff --check`
- Local HTTP response and exact definition-copy checks

final result: passed
