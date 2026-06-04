# 🌤️ SkyWatch — Alur Program (Workflow Overview)

Proyek ini adalah **Next.js 16** full-stack web app bernama **SkyWatch** — dashboard pemantauan kualitas udara berbasis IoT, dengan pipeline CI/CD ke Docker Hub + Vercel.

---

## 1. Arsitektur Keseluruhan

```mermaid
graph TD
    subgraph USER["👤 Pengguna"]
        Browser["Browser / Client"]
    end

    subgraph FRONTEND["🖥️ Frontend (Next.js App Router)"]
        Landing["/ — Landing Page\n(components/landing-page.tsx)"]
        Login["app/login"]
        Register["app/register"]
        Monitoring["app/monitoring"]
        Reports["app/reports"]
        Complaints["app/complaints"]
        Education["app/education"]
        Profile["app/profile"]
        Admin["app/admin"]
    end

    subgraph API["🔌 API Routes (app/api/)"]
        AuthAPI["auth/ (login, logout, register, me, profile, password, upload)"]
        SensorAPI["sensor/ (data sensor + status)"]
        AdminAPI["admin/ (users, sensor, stats, sales)"]
        ComplaintAPI["complaints/"]
        NotifAPI["notifications/"]
        DeviceAPI["devices/"]
        ShareAPI["shares/"]
        SettingAPI["settings/"]
    end

    subgraph LIB["📚 Library (lib/)"]
        DB["db.ts — MySQL Pool\n(mysql2/promise)"]
        Auth["auth.ts — JWT\n(jose, cookies)"]
        Mailer["mailer.ts — Email\n(nodemailer)"]
        Notif["notifications.ts"]
    end

    subgraph INFRA["☁️ Infrastruktur"]
        MySQL["MySQL Database\n(Cloud)"]
        Docker["Docker Hub\n(skywatch-app:latest)"]
        Vercel["Vercel\n(sin1 — Singapore)"]
    end

    Browser --> Landing
    Browser --> Login
    Browser --> Register
    Browser --> Monitoring
    Browser --> Reports
    Browser --> Complaints
    Browser --> Education
    Browser --> Profile
    Browser --> Admin

    FRONTEND --> API
    API --> LIB
    LIB --> MySQL
    LIB --> Mailer

    Vercel --> FRONTEND
    Docker -.->|"Image reference"| Vercel
```

---

## 2. Alur Autentikasi (Login / Register)

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Page as app/login atau /register
    participant API as /api/auth/login (atau /register)
    participant DB as MySQL (lib/db.ts)
    participant Auth as lib/auth.ts (JWT)
    participant Cookie as Browser Cookie

    User->>Page: Isi form & Submit
    Page->>API: POST request (email, password)
    API->>DB: Query user by email
    DB-->>API: Data user
    API->>API: bcryptjs.compare(password, hash)
    API->>Auth: signToken({ userId, role, ... })
    Auth-->>API: JWT token (expire 24h)
    API->>Cookie: Set cookie 'session' = JWT
    API-->>Page: Response 200 OK
    Page-->>User: Redirect ke /monitoring atau /admin
```

> **Auth library:** `jose` (JWT) + `bcryptjs` (hash password) + Next.js `cookies()`

---

## 3. Alur Data Sensor (IoT → Dashboard)

```mermaid
sequenceDiagram
    participant Device as 🌡️ Perangkat IoT / Sensor
    participant API as /api/sensor
    participant DB as MySQL
    participant Page as app/monitoring (Dashboard)
    participant Chart as Recharts (Grafik)

    Device->>API: POST /api/sensor (data PM2.5, CO, suhu, dll.)
    API->>DB: INSERT sensor_readings
    DB-->>API: OK

    Page->>API: GET /api/sensor (fetch data terbaru)
    API->>DB: SELECT sensor_readings
    DB-->>API: Array data
    API-->>Page: JSON response
    Page->>Chart: Render grafik real-time
    Chart-->>Page: Tampilkan ke user
```

---

## 4. Alur Pengaduan (Complaints)

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Page as app/complaints
    participant API as /api/complaints
    participant DB as MySQL
    participant Mailer as lib/mailer.ts (Nodemailer)

    User->>Page: Isi form pengaduan
    Page->>API: POST /api/complaints
    API->>DB: INSERT complaint
    API->>Mailer: Kirim email notifikasi ke admin
    Mailer-->>API: Email terkirim
    API-->>Page: Response sukses
    Page-->>User: Konfirmasi pengaduan diterima
```

---

## 5. Alur Admin Panel

```mermaid
graph LR
    Admin["app/admin"] --> Stats["/api/admin/stats — Statistik umum"]
    Admin --> Users["/api/admin/users — Kelola user"]
    Admin --> Sensor["/api/admin/sensor — Kelola perangkat sensor"]
    Admin --> Sales["/api/admin/sales — Data penjualan / laporan"]
```

> Semua endpoint `/api/admin/*` dilindungi oleh verifikasi JWT + pengecekan `role === 'admin'`

---

## 6. Alur CI/CD (DevOps Pipeline)

```mermaid
flowchart TD
    Dev["👨‍💻 Developer\npush code"] --> GitHub["GitHub Repository"]

    GitHub -->|"push ke develop / PR ke main"| CI

    subgraph CI["🔍 CI Pipeline (.github/workflows/ci.yml)"]
        CI1["Checkout Code"]
        CI2["Setup Node.js 20"]
        CI3["npm ci (install deps)"]
        CI4["ESLint (npm run lint)"]
        CI5["TypeScript Check (tsc --noEmit)"]
        CI6["Build Next.js (npm run build)"]
        CI7["Upload artifact .next/"]
        CI1-->CI2-->CI3-->CI4-->CI5-->CI6-->CI7
    end

    GitHub -->|"push ke main / master"| CD

    subgraph CD["🚀 CD Pipeline (.github/workflows/cd.yml)"]
        CD1["Checkout Code"]
        CD2["Login Docker Hub"]
        CD3["Setup Docker Buildx"]
        CD4["Build & Push Docker Image\n→ Docker Hub (skywatch-app:latest)"]
        CD5["Install Vercel CLI"]
        CD6["vercel pull --environment=production"]
        CD7["vercel build --prod"]
        CD8["vercel deploy --prebuilt --prod"]
        CD1-->CD2-->CD3-->CD4-->CD5-->CD6-->CD7-->CD8
    end

    CD8 --> Vercel["🌐 Vercel Production\n(Region: sin1 — Singapore)"]
    CD4 --> DockerHub["🐳 Docker Hub\nskywatch-app:latest"]
```

---

## 7. Ringkasan Stack Teknologi

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16.2.3 (App Router) |
| **UI** | React 19, Tailwind CSS v4, Recharts, Lucide React |
| **Database** | MySQL (via `mysql2/promise`, connection pool) |
| **Autentikasi** | JWT (`jose`) + bcryptjs + Cookie session |
| **Email** | Nodemailer |
| **CI/CD** | GitHub Actions (CI: lint+build, CD: Docker+Vercel) |
| **Deployment** | Vercel (Singapore), Docker Hub (image backup) |
| **Bahasa** | TypeScript |

---

## 8. Halaman / Fitur yang Ada

| Route | Fungsi |
|---|---|
| `/` | Landing page publik (SkyWatch intro) |
| `/login` | Login user |
| `/register` | Registrasi user baru |
| `/monitoring` | Dashboard data kualitas udara real-time |
| `/reports` | Laporan historis |
| `/complaints` | Form pengaduan |
| `/education` | Konten edukasi kualitas udara |
| `/profile` | Profil user |
| `/admin` | Panel admin (user, sensor, statistik) |
