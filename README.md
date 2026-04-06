# CarPool — Deljenje prevozov

Spletna aplikacija za deljenje prevozov med mesti. Vozniki objavljajo vožnje, potniki pa rezervirajo sedeže. Aplikacija vključuje sistem čakalne vrste, ki avtomatično dodeli mesto prvemu na čakalni listi, ko pride do odpovedi rezervacije.

## Tehnologije

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** NestJS + TypeORM
- **Baza podatkov:** PostgreSQL (Supabase)
- **Avtentikacija:** JWT (JSON Web Tokens)

## Lokalni zagon

### Predpogoji

- Node.js 20+
- npm
- Git

### 1. Kloniranje repozitorija

```bash
git clone https://github.com/indeeded/carpooling-app
cd carpooling-app
```

### 2. Nastavitev backenda

```bash
cd backend
npm install
```

Ustvari datoteko `.env` v mapi `backend/`:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=tvoj-dolg-nakljucni-niz
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

Zaženi backend:

```bash
npm run start:dev
```

Backend bo dosegljiv na `http://localhost:3000`.

### 3. Nastavitev frontenda

```bash
cd frontend
npm install
```

Ustvari datoteko `.env` v mapi `frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
```

Zaženi frontend:

```bash
npm run dev
```

Frontend bo dosegljiv na `http://localhost:5173`.

## Funkcionalnosti

- Registracija in prijava (vloge: voznik / potnik)
- Nalaganje profilne slike
- Objava vožnje z datumom, ceno in številom sedežev
- Iskanje in filtriranje voženj po mestu in datumu
- Rezervacija sedeža
- Čakalna vrsta z avtomatsko promocijo ob odpovedi
- Nadzorna plošča za voznike in potnike

## Produkcijska različica

- **Frontend:** Se ni
- **Backend:** Ni se

## Avtor

Alex Hribar
