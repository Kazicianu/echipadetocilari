# Homepage FAQ mascot

The FAQ uses an original procedural 3D illustration of a friendly adult nerd reading a book. He has natural peach skin, a smaller oval human face, short side-parted brown hair, normal ears, a soft nose and eyebrows, small relaxed eyes, charcoal round glasses and a closed smile. An orange sweater, white collar, small orange bow tie and orange trousers connect him to the site's palette. He sits cross-legged with natural hands holding a white book with orange covers, with his head and gaze directed down toward the pages. The original logo assets are unchanged.

## Files and API

- `legacy-mirror/wp-content/ect-pages/home/faq-mascot-3d.js`: geometry, studio lighting and articulated animation.
- `legacy-mirror/wp-content/ect-pages/home/faq-tocilar-reader.webp`: transparent 640 by 640 pixel static poster exported from the same human model, approximately 27 KB. It appears before loading, without JavaScript and with reduced motion. The poster and canvas share the same composition.
- `legacy-mirror/wp-content/ect-pages/home/faq-mascot.js`: lazy loading, viewport visibility and the translated pause/play button.
- `legacy-mirror/wp-content/ect-pages/home/three.module.min.js`: locally vendored Three.js 0.160.1. Its MIT license is retained in `three-LICENSE.txt`.
- `mountMascot(host)` imports Three locally and returns `{ setPaused, capturePoster, dispose }`. It returns `null` when import or WebGL setup fails, preserving the image fallback.
- After the first successful render, the module sets `data-mascot-ready="true"` on the host. The root loader owns loading near the viewport, the pause control and the fallback image.
- `capturePoster()` renders a neutral pose at 640 by 640 pixels with a transparent background, returns a PNG data URL, then restores the prior resolution and pose. It does not replace the production image itself.

## Motion and limits

The purpose is occasional marketing delight. A 12-second reading cycle includes a 1.8-second page turn, a short return of the hand, two 220 ms blinks, restrained head movement and subtle torso breathing. Head, eyes, articulated arms and the actual page mesh move separately. Page rotation uses `cubic-bezier(0.77, 0, 0.175, 1)`; the entire character does not float or bounce.

Rendering is capped at 30 frames per second and device pixel ratio 1.75. The module pauses when requested by its controller, `data-paused="true"`, a hidden document or a lost graphics context. Reduced motion shows one neutral pose. Page vertices and normals update only when page curl changes. Geometry, materials, textures, observers, listeners and the renderer are released by `dispose()`.

The canvas uses procedural geometry and local code only. No remote models, textures, animation services or asset requests are needed. A blurred radial contact shadow grounds the character. Self shadows remain on the character and book.

The FAQ uses the design-system font Montserrat and colors white `#fff`, ink `#27272d`, orange `#fd8649`, and orange-deep `#ad420f`. Questions have white bubbles with ink text, no shadow, and a subtle continuous 1px outline around the body and tail: gray `#e9e9e9` at rest, the design-system FAQ line color `#efd9ce` on hover, and site orange `#fd8649` when open, including the tail. The expanded minus uses site orange `#fd8649`; the collapsed plus remains ink `#27272d`. Answers have orange bubbles with ink text (6.14:1 contrast). The eyebrow and contact button use orange-deep text on white (5.89:1 contrast); the contact button uses ink text on orange when hovered (6.14:1 contrast). The mascot uses natural skin and brown hair with orange clothing and a white collar.

The section introduces the FAQ with "Tu întrebi. Noi lămurim." and an outlined orange pill labelled "Hai să vorbim". English copy is generated through the dictionary. The button scrolls to the homepage contact form.
