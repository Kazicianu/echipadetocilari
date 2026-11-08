# /creare-site-web/: ce trebuie completat

Pagina e implementată în `legacy-mirror/creare-site-web/index.html`, exact ca mockup-ul aprobat pe 08.11.2026. Informațiile de mai jos lipsesc încă. Pe pagină, locul fiecăreia e marcat cu o casetă punctată „De completat” sau „De confirmat” (clasa `csw-todo`, 13 casete). Casetele sunt vizibile, deci un `git push` le publică așa cum sunt: completează-le înainte de publicare.

## Informații de la tine, cu casetă pe pagină

| # | Ce lipsește | Unde apare pe pagină | Observații |
| --- | --- | --- | --- |
| 1 | Durata tipică pentru fiecare tip de site: landing page, site de prezentare, magazin online, proiect custom | „Pe scurt” › „Cât durează?”; „Pas cu pas” › 03 „Construim”; FAQ „Cât durează să fie gata?” | Aceeași durată în toate trei locurile. |
| 2 | Cine deține site-ul, domeniul, găzduirea și conturile după lansare și cum poate pleca clientul la altă firmă | „Pe scurt” › „Al cui e site-ul?”; „Cum alegi firma” › „Al cui e site-ul după lansare?”; FAQ „Al cui este site-ul după lansare?” | Trei casete. |
| 3 | Formularea despre TVA | Nota de sub prețuri; FAQ „Prețurile includ TVA?” | Firma nu e plătitoare de TVA (ANAF, verificat pe 22.10.2026). De stabilit cum scriem: de exemplu, că prețurile sunt finale și nu se adaugă TVA. |
| 4 | Autorul paginii: nume, rol, eventual o fotografie sau un link | „Pe scurt”, lângă „Actualizat: 8 noiembrie 2026” | Ajută la E-E-A-T și poate intra în schema paginii. |
| 5 | Textele și fotografiile site-ului: le aduce clientul sau le pregătim noi, și cât costă | „Ce influențează prețul unui site” › „Textele și fotografiile” | |
| 6 | Lista exactă a elementelor SEO incluse în pachet | „Ce include” › 05 „Optimizarea SEO de bază” | De exemplu: titluri și descrieri, structura titlurilor, viteză, sitemap, Search Console. Doar ce facem cu adevărat. |
| 7 | Domeniul și găzduirea: incluse în preț sau plătite separat, și cât costă | „Ce include” › 06 „Publicarea și predarea” | |
| 8 | Termenul ofertei: în câte zile primește clientul oferta scrisă după primul apel | „Pas cu pas” › 02 „Primești oferta” | |

## Informații care ar întări pagina (fără casetă)

- **Oamenii din echipă**: nume, roluri, fotografii. Secțiunea „O echipă mică de tocilari din București” a fost scoasă la cererea ta; autorul de la punctul 4 poate acoperi o parte.
- **Proiecte reale de site-uri**, cu acordul clienților, pentru dovezi pe pagină și în `/portofoliu/`.
- **Recenzii Google reale**. Profilul Google Business nu e creat încă (decizia din 31.10.2026: zonă deservită, adresă ascunsă, telefon 0750 203 466, program L-D 9-20).

## După ce ai informațiile

1. Înlocuiește fiecare `<span class="csw-todo">…</span>` cu textul final, în `legacy-mirror/creare-site-web/index.html`.
2. Actualizează traducerea EN în `scripts/i18n/website-design.mjs` (pagina `/en/website-design/` se generează din cea română).
3. Răspunsurile FAQ completate intră automat în schema FAQPage. Build-ul exclude doar răspunsurile care încă au „De completat” sau „De confirmat”.
4. Schimbă data din „Actualizat” (`<time datetime="…">`). Ea dă și `dateModified` în schema paginii.
5. Dacă se schimbă un preț, schimbă-l peste tot: cardul de preț, eticheta din tab, „Pe scurt”, FAQ și descrierea din `scripts/i18n/meta-ro.mjs`. Testul `scripts/lib/website-page.test.mjs` verifică dacă se potrivesc.
6. Înainte de publicare, `grep -n "csw-todo" legacy-mirror/creare-site-web/index.html` nu trebuie să mai găsească nimic. Testul de pagină așteaptă acum 13 casete; actualizează-l odată cu ele.
