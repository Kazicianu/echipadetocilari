# Publicare — 16 septembrie 2026

Site public: https://www.echipadetocilari.ro

Proiect Vercel: `kazicianus-projects/echipadetocilari`, planul existent Hobby.
Deployment: `dpl_2z44QAM9usHdNd9Zc2LTJw7vKgvx`.
Publicare direct din fișierele locale, fără commit sau push.

## Publicare automată din GitHub

Repository-ul original `wilhelm-create/echipadetocilari` a fost duplicat prin fork în `Kazicianu/echipadetocilari`, la cererea utilizatorului. Copia păstrează commitul `17fe69e4036a9669fed1760926270d638e16bee6` pe `main` și vizibilitatea publică a originalului.

Proiectul Vercel este conectat la `Kazicianu/echipadetocilari` (repo ID `1373337957`), cu `productionBranch=main`, `buildCommand=npm run build` și `outputDirectory=dist`. Push-urile viitoare pe `main` sunt configurate să declanșeze publicarea automată. `origin` local indică noua copie, iar `upstream` păstrează originalul Wilhelm.

Conectarea nu a înlocuit deploymentul live: acesta rămâne `dpl_2z44QAM9usHdNd9Zc2LTJw7vKgvx`, publicat din fișiere locale. Cele 61 de fișiere locale propuse pentru sincronizare au fost verificate într-o copie izolată: 25/25 teste și build de producție cu 22 de pagini. Nu s-a creat commit și nu s-a făcut push; sincronizarea și verificarea primului deploy declanșat de GitHub așteaptă aprobarea explicită cerută de regulile Git ale utilizatorului.

## Configurație activă

- 22 de pagini: 11 RO și 11 EN; indexare activă în Production și dezactivată în Preview.
- `www` CNAME: `adbb0dd5f330ebe6.vercel-dns-017.com`, TTL 300; HTTPS verificat pe Vercel.
- Domeniul fără `www` folosește două înregistrări A către Vercel: `216.198.79.1` și `64.29.17.1`, ambele cu TTL 300. Configurația a fost verificată pe toate cele patru nameservere Hostico, Google DNS și Cloudflare DNS.
- Domeniul fără `www` este deja verificat în Vercel și configurat acolo cu redirect permanent HTTP 308 către `www.echipadetocilari.ro`.
- MX: `mail.echipadetocilari.ro`, prioritate 0, TTL 300. `mail` A: `185.220.186.186`; `imap` și `smtp` CNAME către `mail.echipadetocilari.ro`. Căsuțele și serviciile de email rămân pe Hostico.
- Înregistrările TXT de verificare Vercel sunt la `_vercel`.
- Resend: domeniu verificat, DKIM la `resend._domainkey`, CNAME `rsend` către `rsend-euw1.forge.rmta.net` și CNAME `send` către `send.forge.rmta.net`. Primirea mesajelor în Resend este dezactivată.
- Cheia `echipadetocilari-vercel` are doar Sending access pentru `echipadetocilari.ro`. Valoarea este stocată ca Secret `RESEND_API_KEY` în Vercel Production și Preview; nu în sursele site-ului.
- `CONTACT_FROM=contact@echipadetocilari.ro`.
- `CONTACT_TO=contact@echipadetocilari.ro,andrei.cazimirovici@gmail.com`.
- `CONTACT_SPAM_PROTECTION=vercel-waf`; regula WAF limitează POST pe `/api/contact` și `/api/contact/` la 5 cereri/IP/60 secunde.

## Verificări

- 25/25 teste locale reușite și build de producție validat pe Vercel.
- 22 de pagini și 125 de resurse verificate cu răspuns HTTP 200; metadate, hreflang, JSON-LD, robots și sitemap corecte.
- WAF verificat cu cereri invalide: răspuns 429 la depășirea limitei.
- Un singur email de test trimis prin formular; Resend confirmă Delivered pentru ambii destinatari. ID: `36f159b3-1616-47d1-8bb3-ebe2e3ff91dd`.
- Confirmarea de succes a formularului a fost verificată în browser pe URL-ul deploymentului de producție. Aliasul temporar `echipadetocilari-olive.vercel.app` nu este în lista originilor permise pentru formular; domeniul public și URL-ul deploymentului sunt permise.

## Mutarea domeniului fără `www`

Mutarea a fost executată pe 16 septembrie 2026, la cererea explicită a utilizatorului „muta acum”, după explicarea riscului temporar pentru email cauzat de vechile înregistrări MX memorate în cache. Amânarea până la 22:45 a fost anulată; nu există o automatizare creată și nu mai este necesară o execuție ulterioară.

Înregistrarea A `185.220.186.186` a fost înlocuită cu două înregistrări A către Vercel: `216.198.79.1` și `64.29.17.1`, ambele cu TTL 300. Certificatul HTTPS pentru `echipadetocilari.ro` a fost emis cu succes de Vercel. Verificările TLS pe ambele IP-uri au trecut: apex răspunde cu HTTP 308 către `www`, păstrând calea și parametrii URL, iar `www` răspunde cu HTTP 200. Endpointul GET `/api/contact/` răspunde `ok: true`, cu protecție `vercel-waf`; nu s-a trimis un nou email de test.

Toate cele patru nameservere `ns1–4.hostico.ro`, plus `1.1.1.1` și `8.8.8.8`, confirmă configurația A/MX/mail așteptată (18/18 verificări). Înregistrarea MX către `mail.echipadetocilari.ro` și înregistrarea A `mail` către `185.220.186.186` rămân pe Hostico. Cache-urile care au păstrat vechile înregistrări de email pot continua temporar să folosească configurația anterioară; vechiul TTL era 14400 (4 ore).

Nu șterge găzduirea Hostico: aceasta deservește în continuare emailul și alte site-uri.
