# Shadowy

> B2B platforma birojiem, kas palīdz padarīt neredzamo darbu redzamu.

Shadowy ļauj komandām strukturēti pierakstīt palīdzību kolēģiem, jauno darbinieku ievadīšanu, koordināciju un citu darbu, kas parasti netiek pamanīts. Vadītāji iegūst skaidru priekšstatu par patieso slodzi un var godīgāk pieņemt lēmumus par darba sadali.

Shadowy **nav** darbinieku novērošanas rīks. Mērķis ir godīga slodzes redzamība un labāka komunikācija starp vadītājiem un darbiniekiem.

## Tehniskais steks

- **Next.js 14** (App Router) + **TypeScript**
- **Prisma** + **PostgreSQL** (gatavs Neon / Supabase / Railway)
- **Tailwind CSS** + shadcn/ui-stila komponenti
- **bcryptjs** paroļu hešēšanai
- **jose** JWT sesijas sīkdatnēm
- **Zod** servera puses validācijai
- **Vercel-ready** izvietošana

## Pirmā palaišana

### 1. Atkarību uzstādīšana

```bash
npm install
```

### 2. Vides mainīgo iestatīšana

Nokopējiet `.env.example` uz `.env` un aizpildiet:

```bash
cp .env.example .env
```

Iestatiet `DATABASE_URL` un ģenerējiet `SESSION_SECRET`:

```bash
openssl rand -base64 32
```

### 3. Datubāzes shēma + sēklas dati

```bash
npm run db:push      # piemēro Prisma shēmu uz datubāzi
npm run db:seed      # izveido demo organizāciju un lietotājus
```

### 4. Palaišana

```bash
npm run dev
```

Atveriet [http://localhost:3000](http://localhost:3000).

### Demo lietotāji

Pēc `db:seed` ir pieejami šādi konti (parole visiem: **`Parole123!`**):

| Loma         | E-pasts             |
|--------------|---------------------|
| Administrators | `admin@demo.lv`     |
| Vadītājs       | `vaditajs@demo.lv`  |
| Darbinieks 1   | `ilze@demo.lv`      |
| Darbinieks 2   | `janis@demo.lv`     |

## Arhitektūra īsumā

```
src/
├── app/
│   ├── (auth)/                    # /login, /register
│   ├── admin/                     # ADMIN aizsargātās lapas
│   ├── manager/                   # MANAGER aizsargātās lapas
│   ├── employee/                  # EMPLOYEE aizsargātās lapas
│   ├── api/auth/logout/route.ts   # logout endpoint
│   ├── layout.tsx                 # globālais layouts (lang="lv")
│   └── page.tsx                   # publiskā mājas lapa
├── components/
│   ├── ui/                        # primitīvi (Button, Card, Input, ...)
│   ├── layout/                    # AppShell, Sidebar, PageHeader
│   ├── dashboard/                 # KpiCard
│   ├── entries/                   # EntryCard, EntryForm, ReviewActions, StatusBadge
│   └── auth/                      # LoginForm, RegisterForm
├── lib/
│   ├── db.ts                      # Prisma klients (singleton)
│   ├── session.ts                 # JWT sesijas (Edge-safe verify)
│   ├── auth.ts                    # bcrypt + requireUser() helperi
│   ├── i18n.ts                    # enum → latviešu valodas etiķetes
│   └── utils.ts                   # cn(), formatDateLV, formatDurationLV, slugify
├── middleware.ts                  # role-aware route protection
└── types/
prisma/
├── schema.prisma                  # Organization, User, InvisibleWorkEntry, Category
└── seed.ts                        # demo dati latviski
```

### Multi-tenant princips

Katra organizācija ir izolēta. Visi datubāzes vaicājumi ietver `organizationId` filtru, kas tiek ņemts no sesijas. Vadītājs no Uzņēmuma A nekādā veidā neredz Uzņēmuma B datus.

### Lomu plūsma

```
ADMIN     →  veido vadītājus, redz visu organizāciju
MANAGER   →  veido darbiniekus, izskata savas komandas ierakstus
EMPLOYEE  →  iesniedz neredzamā darba ierakstus, redz savu vēsturi
```

### Auth

- Paroles hešē ar `bcryptjs` (10 raundi).
- Sesija = `jose` parakstīta JWT sīkdatne (`httpOnly`, `sameSite=lax`).
- `middleware.ts` aizsargā `/admin`, `/manager`, `/employee` un novirza atkarībā no lomas.
- Servera puses `requireUser([roles])` katrā lapā/aktīvitātē otrreiz pārbauda lomu.

## Kas šobrīd strādā

- Reģistrācija: izveido organizāciju + pirmo administratora kontu, automātiski ielogo.
- Pieslēgšanās / iziešana ar drošu sesiju.
- Lomu balstīta navigācija un piekļuves kontrole (middleware + lapas līmenī).
- ADMIN: pārskats ar KPI, vadītāju izveide, visu darbinieku tabula, visi ieraksti.
- MANAGER: pārskats ar KPI, darbinieku izveide, komandas ierakstu izskatīšana (apstiprināt / noraidīt / nosūtīt atpakaļ ar komentāru), atsevišķa darbinieka profils.
- EMPLOYEE: pārskats, jaunā ieraksta forma (Nosaukums / Kategorija / Apraksts / Datums / Ilgums), pilna vēsture ar statusu un vadītāja komentāriem.
- Datu izolācija pēc `organizationId` visās lasīšanas un rakstīšanas operācijās.
- 100% latviešu valodas UI: virsraksti, navigācija, formu etiķetes, vietzīmes, statusi, tukšie stāvokļi, validācijas kļūdas, palīgteksti.

## Kas pagaidām ir MVP / placeholder

- Paroles nomaiņa, paroles atjaunošana — nav ieviesta. Pagaidām administrators / vadītājs piešķir sākotnējo paroli.
- E-pasta paziņojumi — nav. Lietotāji statusu redz iekšā Shadowy.
- Audit log / aktivitāšu žurnāls atsevišķā lapā — nav (redzams tikai "Nesenā aktivitāte" admin pārskatā).
- Eksports (CSV / PDF) — nav.
- Daudzkrāsainie filtri un sarežģīta meklēšana — nav (sākotnējās tabulas un kartes ir sakārtotas pēc datuma).
- Komandas pārvaldīšana citu vadītāju starpā (pārvietot darbinieku no viena vadītāja pie otra) — nav.

## Nākamie soļi (rekomendētā secība)

1. **Paroles nomaiņa lietotāja profilā** + administratora "atiestatīt darbinieka paroli" darbība.
2. **E-pasta paziņojumi** (Resend / Postmark) — darbinieks saņem ziņu, kad ieraksts ir izskatīts; vadītājs — kad ir jauns iesniegums.
3. **Filtri un meklēšana** ierakstu sarakstos (statuss, kategorija, periods).
4. **CSV eksports** vadītājam un administratoram.
5. **Audit log** kā atsevišķa lapa.
6. **Darbinieku pārcelšana** starp vadītājiem (ADMIN darbība).
7. **Komandas analītika** — apkopojumi pa kategorijām, pa nedēļām/mēnešiem.
8. **Tikai pēc tam** sākt apsvērt integrācijas (Slack/Jira/Calendar) un AI ieteikumus, kā plānots vēlākajos posmos.

## Izvietošana uz Vercel

1. Izveidojiet Postgres datubāzi (Neon ir vienkāršākais variants).
2. Vercel projekta vides mainīgajos iestatiet `DATABASE_URL` un `SESSION_SECRET`.
3. `npm run build` palaiž `prisma generate` un Next build.
4. Pirmajā izvietošanā palaidiet `npx prisma db push` pret produkcijas datubāzi (vai izmantojiet `prisma migrate`).

## Valodas politika

Visa lietotāja saskarne ir **tikai latviešu valodā**. Lūdzu, sekojiet šim principam, pievienojot jaunas funkcijas — kods un mainīgo nosaukumi paliek angļu valodā, bet viss, ko redz gala lietotājs (etiķetes, pogas, virsraksti, tukšie stāvokļi, kļūdu paziņojumi, palīgteksti), jābūt latviešu valodā.
