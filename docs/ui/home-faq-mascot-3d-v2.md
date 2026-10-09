# Homepage FAQ: new 3D mascot

The current mascot is a new procedural clay character, seated with a laptop and greeting the visitor. It replaces the illustrated 2D version and the earlier 3D reader. Its character geometry and pose are built separately from the reader: a rounded face, large round glasses, bright eyes, cheeks, a smile with teeth, swept brown hair, an orange sweater, dark trousers and white sneakers.

## Source and integration

- `legacy-mirror/wp-content/ect-pages/home/faq-mascot-3d-v2.js` builds the geometry, lighting, camera and articulated motion.
- `legacy-mirror/wp-content/ect-pages/home/faq-tocilar-3d-v2.webp` is a transparent 640 by 640 poster exported from the same scene. It also appears without JavaScript, with reduced motion and when WebGL cannot start.
- `legacy-mirror/wp-content/ect-pages/home/faq-mascot.js` loads the new module near the viewport and controls visible, paused and reduced-motion states.
- `legacy-mirror/wp-content/ect-pages/home.css` positions the canvas and preserves the existing FAQ layout and brand colors.
- The local Three.js module and its MIT license are reused. No remote assets or additional animation library are required.

`mountMascot(host)` returns `{ setPaused, capturePoster, dispose }`, or `null` when setup fails. The canvas is decorative; the static image supplies the accessible description. The image is hidden visually only after the first successful render. The English image description and pause controls are generated through the translation dictionary.

## Motion and fallback

The purpose is occasional marketing delight. A 10-second cycle includes an articulated forearm and wrist greeting, two blinks, a small head tilt and restrained breathing. The laptop and overall character position stay steady. The greeting envelope uses `cubic-bezier(0.77, 0, 0.175, 1)`.

Rendering is capped at 30 frames per second and device pixel ratio 1.75. Pause preserves the current pose. Offscreen state, a hidden document and reduced motion suspend rendering. A lost graphics context restores the poster; a restored context renders again. Disposal releases animation frames, observers, registered listeners, geometry, materials, textures, shadow resources and the renderer, including partial setup failures.

`capturePoster()` renders the neutral welcoming pose at 640 pixels with transparency, then restores the prior size, pixel ratio and pose. Export the returned PNG as WebP in the source asset directory and rebuild; do not edit `dist/` manually.

The homepage still uses white text on the original orange answer bubbles, the orange eyebrow and the orange outlined contact button. Their existing white/orange contrast limitation is documented in the design system. This mascot change does not alter FAQ copy, contact delivery, indexing settings or page routes.
