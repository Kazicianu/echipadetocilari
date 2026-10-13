# FAQ character: the client who asks

The character beside the FAQ on the homepage and on `/creare-magazin-online/` is the client, the person who asks the questions. It replaces the agency nerd in both places, so the picture matches the chat layout: white question bubbles from the client, orange answers from the agency.

He is a procedural clay shop owner from the same 3D world as the agency mascot: short chestnut hair with a side parting, a tidy beard and moustache, a cream shirt with rolled sleeves, an ink apron with one brand orange pocket, gray trousers and white sneakers. He holds a taped parcel against his hip, raises his index finger and has a white chat bubble with an orange question mark beside his head. He has no round glasses and no bow tie; those stay the signature of the agency nerd.

The agency nerd is still used where the agency speaks: `faq-tocilar-3d-v2.webp` stays in the "Pentru cine e" panel and in the sharing image of the store page. The earlier FAQ models are described in [home-faq-mascot-3d-v2.md](home-faq-mascot-3d-v2.md) and [home-faq-mascot-3d.md](home-faq-mascot-3d.md).

## Source and integration

- `legacy-mirror/wp-content/ect-pages/home/faq-mascot-client-3d.js` builds the geometry, lighting, camera and articulated motion. It imports only the local Three.js module.
- `legacy-mirror/wp-content/ect-pages/home/faq-client-3d.webp` is the transparent 640 by 640 poster, exported from the neutral pose of the same scene (WebP quality 90, about 28 KB).
- Homepage, RO and generated EN: `faq-mascot.js` loads the module near the viewport and controls the visible, paused and reduced-motion states. The poster appears before loading, without JavaScript, with reduced motion and when WebGL cannot start.
- `/creare-magazin-online/`: the page shows only the poster, with the existing gentle CSS sway and its pause button. The floating CSS question marks were removed, because the bubble already carries the question and the marks landed on the face and on the bubble.
- The Romanian image description is in the markup of both pages. The English one is generated through `scripts/i18n/dictionary.mjs`.
- `scripts/lib/standalone-assets.mjs` lists the module, because a lazy import is not discoverable from a script tag.

`mountMascot(host)` returns `{ setPaused, capturePoster, dispose }`, or `null` when setup fails, exactly like the previous model. The canvas is decorative; the static image supplies the accessible description and is hidden visually only after the first successful render.

## Motion and fallback

The purpose is occasional marketing delight. In a 10-second cycle he glances up at the bubble, both brows rise, the finger lifts, the bubble pops once and he says his question; he is back at rest before the fourth second. Two blinks and restrained breathing fill the remaining time. The character does not float or bounce. The neutral pose already shows the raised finger and the question mark, so the poster reads the same as the animation.

Rendering is capped at 30 frames per second and device pixel ratio 1.75. Pause preserves the current pose. Offscreen state, a hidden document and reduced motion suspend rendering. A lost graphics context restores the poster; a restored context renders again. Disposal releases animation frames, observers, listeners, geometry, materials, textures, shadow resources and the renderer.

## Exporting the poster

`capturePoster(time = 0)` renders the pose at the given second at 640 pixels with transparency and returns a PNG data URL, then restores the prior size, pixel ratio and pose. Without an argument it returns the neutral pose used for the poster. Convert the PNG to WebP with alpha, save it as `faq-client-3d.webp` in the source asset directory and rebuild; do not edit `dist/` manually.

## Choice of character

Three candidates were built and compared on concept, craft and code: an entrepreneur with a phone, this shop owner, and a seated client with a raised hand. The shop owner was the clearest read of "a customer asking something" at 160 px. The trade-off is that the apron and the parcel point to retail. That fits the store page exactly; on the homepage he stands in for any small business owner.
