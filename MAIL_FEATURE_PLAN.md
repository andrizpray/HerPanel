# Rencana Pengembangan Fitur Email v2 untuk HerPanel

## Latar Belakang
HerPanel saat ini menggunakan layanan email tradisional (Postfix/Dovecot) dengan Roundcube sebagai webmail. Untuk mengurangi biaya operasional dan memberikan UI yang lebih modern, kita dapat mengganti sebagian fungsionalitas email dengan layanan berbasis API seperti **Resend** untuk pengiriman dan **S3/R2** untuk penyimpanan attachment, sambil tetap menggunakan Laravel sebagai inti sistem (auth, billing, domain, dsb).

## Tujuan
- Mengirim email melalui Resend API (tidak perlu menjalankan SMTP server terus‑menerus).
- Menyimpan attachment ke storage S3-kompatibel (mis. Cloudflare R2 atau AWS S3).
- Menyediakan UI mailbox sederhana berbasis React + Inertia (route `/mail/*`).
- Mempertahankan Roundcube sebagai opsional bagi user yang butuh IMAP full‑fitur.
- Mengikuti konvensi Git: setiap perubahan langsung commit & push ke GitHub.

## Struktur Rencana

### 1. Persiapan Paket & Konfigurasi
```bash
composer require resend/resend-php
composer require league/flysystem-aws-s3-v3
```
`.env` tambahan:
```
RESEND_KEY=your_resend_api_key
MAIL_MAILER=resend
RESEND_FROM=HerPanel <mail@yourdomain.com>

AWS_ACCESS_KEY_ID=your_r2_access_key
AWS_SECRET_ACCESS_KEY=your_r2_secret_key
AWS_DEFAULT_REGION=auto
AWS_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
AWS_BUCKET=herpanel-attachments
FILESYSTEM_DRIVER=s3
```

### 2. Model & Migrasi
- Ubah/ekstensi model `EmailAccount` atau buat model `Mailbox` dengan kolom:
  - `provider` (enum: smtp/resend)
  - `storage_disk`
  - `last_sync_at`
  - dsb.
- Jalankan migrasi untuk menambahkan kolom tersebut.

### 3. Service Layer
- **MailSenderService**: kirim via Resend jika provider=resend, fallback ke Laravel Mail SMTP.
- **AttachmentService**: simpan file ke disk yang ditentukan (default s3), kembalikan URL publik atau signed URL.

### 4. Controller & API Routes
- `MailController` (atau `ApiMailController`):
  - `POST /api/mail/send` – terima payload dan kirim lewat MailSenderService.
  - `GET /api/mail/attachments/{id}` – serve file atau redirect ke signed URL.
  - `GET /api/mail/folders` – daftar folder (Inbox, Sent, Draft, ...) – placeholder untuk saat ini.
- Register di `routes/api.php` di dalam middleware `auth:sanctum` atau `web`.

### 5. Halaman Mailbox (Inertia + React)
Buat folder `resources/js/Pages/Mail/`:
- `Index.jsx` – daftar folder + daftar email (placeholder endpoint `/api/mail/messages?folder=inbox`).
- `Compose.jsx` – form kirim email (panggil `/api/mail/send`).
- `View.jsx` – detail email + attachment.
Gunakan layout `AuthenticatedLayout`.

### 6. Testing & Dokumentasi
- Tambahkan suite testing ke `scripts/test_all_features.php`.
- Buat dokumen internal `references/mail-feature.md` dengan langkah setup .env, contoh penggunaan, dan panduan migrasi dari SMTP lama ke Resend/R2.

### 7. Estimasi Waktu
| Fase | Tugas | Estimasi |
|------|-------|----------|
| 1 | Setup paket, .env, service dasar (sender + attachment) | 4‑6 jam |
| 2 | Controller/API routes + unit test fitur kirim | 3‑4 jam |
| 3 | Halaman mailbox dasar (Inbox, Compose, View) + Integrasi dengan layout | 6‑8 jam |
| 4 | Pengujian manual (kirim email, lampirkan attachment, buka di mailbox) + perbaikan bugs | 2‑3 jam |
| 5 | Dokumentasi + update README/contoh di repo | 1‑2 jam |
| **Total** |  | **≈ 16‑23 jam** |

### 8. Risiko & Mitigasi
| Risiko | Mitigasi |
|--------|----------|
| Resend batas harian (free tier) | Monitor usage; naikkan ke plan paid bila diperlukan; fallback ke SMTP sebagai cadangan. |
| R2 biaya per‑request & storage | Gunakan lifecycle policy; bila cost mengkhawatirkan, gunakan S3 biasa atau storage lokal sebagai fallback. |
| Double‑manajemen credential (SMTP lama vs Resend) | Tambahkan flag `mail_provider` di .env; jika kosong fallback ke konfigurasi lama – memungkinkan rollback cepat. |
| UI mailbox belum support folder/search lengkap | Turutkan sebagai fitur lanjutan (fase 2) setelah versi dasar stabil. Fokus fase 1 pada kirim+lampiran. |

### 9. Verifikasi Setelah Implementasi
1. Jalankan test suite – harus masih lulus.
2. Kirim email lewat form compose → terima di inbox tujuan (cek spam).
3. Lampirkan file → buka lewat halaman View → file terdownload dengan benar.
4. Cek bucket R2/S3 bahwa attachment tersimpan dengan nama unik.
5. Pastikan tidak ada error di `storage/logs/laravel.log` terkait Resend atau S3.

Jika semua berhasil, segera commit & push setiap perubahan (sesuai konvensi “setiap perubahan”) dan deploy ke produksi.

---

## Langkah Selanjutnya (Jika Disetujui)
1. Buat branch baru: `git checkout -b feature/mail-resend-r2`
2. Implementasi sesuai rencana di atas, commit setiap perubahan penting.
3. Push ke GitHub dan buat pull request untuk review.

Catatan: Ini hanya rencana; implementasi aktual dapat menyesuaikan dengan temuan teknis selama proses.