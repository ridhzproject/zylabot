# WhatsApp Bot Sekolah - ZylaBot

Bot WhatsApp untuk manajemen jadwal sekolah, reminder, dan notifikasi otomatis.

## Fitur Utama

### 📚 Jadwal Sekolah
- Lihat jadwal harian
- Foto jadwal lengkap
- Auto reminder jadwal esok hari (18:45)
- Notifikasi ganti pelajaran otomatis

### 📝 Reminder/Catatan
- Tambah, lihat, hapus reminder
- Subscribe reminder otomatis
- Reminder pribadi dengan waktu custom

### 🕌 Jadwal Sholat
- Jadwal sholat harian
- Auto reminder sholat
- Set kota custom
- Subscribe notifikasi sholat

### 😴 Pengingat Tidur
- Auto reminder tidur (21:00-21:35)
- Doa tidur Islam
- Subscribe notifikasi tidur

### ⏰ Reminder Pribadi
- Set reminder custom per user
- Format: besok, nanti, tanggal
- List dan hapus reminder

## Instalasi

```bash
# Clone repository
git clone <repository-url>
cd whatsapp-bot-sekolah

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Jalankan bot
npm start
```

## Konfigurasi

### .env File
```env
BOT_NAME=ZylaBot
OWNER_NUMBER=6282xxxxxxxxx
BOT_NUMBER=6282xxxxxxxxx
PAIRING_CODE=ZYLAON12
TIMEZONE=Asia/Jakarta
DEFAULT_CITY_ID=1615
DEFAULT_CITY_NAME=TUBAN
```

### config.json
- Atur waktu reminder
- Enable/disable fitur auto
- Custom prefix (default: tanpa prefix)

## Struktur Project

```
whatsapp-bot-sekolah/
├── index.js              # Main bot file
├── main.js               # Message handler & commands
├── lib/
│   ├── database.js       # Database functions
│   ├── schedule.js       # Schedule data & functions
│   └── jadwalxia.jpg     # Schedule image
├── data/                 # Database storage
│   ├── reminders.json
│   ├── subs_reminders.json
│   ├── subs_sholat.json
│   ├── subs_sleep.json
│   ├── sholat_settings.json
│   ├── private_reminders.json
│   └── subs_schedule_change.json
├── auth_info_baileys/    # Session storage
├── package.json
├── .env
├── config.json
└── README.md
```

## Commands

### Jadwal
- `jadwal` - Lihat jadwal hari ini
- `jadwalfull` - Foto jadwal lengkap

### Reminder/Catatan
- `addre (judul) | (isi)` - Tambah reminder
- `listre` - List reminder
- `delre (id)` - Hapus reminder

### Subscribe Reminder
- `addsubsre (nomor)` - Subscribe
- `listsubsre` - List subscriber
- `delsubsre (nomor)` - Unsubscribe
- `remindernow` - Kirim reminder now

### Jadwal Sholat
- `jadwalsholat` - Lihat jadwal sholat
- `setkotasholat (kota)` - Set kota
- `addsubsholat (nomor)` - Subscribe
- `listsubsholat` - List subscriber
- `delsubsholat (nomor)` - Unsubscribe

### Pengingat Tidur
- `addsubsleep (nomor)` - Subscribe
- `listsubsleep` - List subscriber
- `delsubsleep (nomor)` - Unsubscribe

### Reminder Pribadi
- `privre besok (jam) (pesan)` - Reminder besok
- `privre nanti (jam) (pesan)` - Reminder hari ini
- `privre tanggal (tgl) (jam) (pesan)` - Reminder tanggal
- `listprivre` - List reminder pribadi
- `delprivre (id)` - Hapus reminder

### Notif Ganti Pelajaran
- `addsubsched (nomor)` - Subscribe
- `listsubsched` - List subscriber
- `delsubsched (nomor)` - Unsubscribe

## Auto Features

### Auto Reminder Jadwal
- Waktu: 18:45 WIB
- Kirim jadwal esok hari
- Kirim daftar reminder/catatan

### Auto Sholat Reminder
- Notifikasi sebelum waktu sholat
- Kata-kata rohani random
- Subscribe per nomor

### Auto Sleep Reminder
- Waktu: 21:00-21:35 WIB (random)
- Pesan tidur random
- Doa tidur Islam

### Auto Schedule Change
- Notifikasi 2 menit sebelum ganti pelajaran
- Kata-kata motivasi random
- Info jam sekarang & selanjutnya

## Notes

- Tanpa prefix (langsung command)
- React dengan ⏳ saat proses
- React dengan ✅ setelah selesai
- Delay 500ms untuk UX lebih baik
- Database JSON (mudah di-backup)
- Pairing code custom: ZYLAON12

## Dependencies

- @fuxxy-star/baileys (latest)
- @hapi/boom
- axios
- dotenv
- moment-timezone
- node-cron
- pino

## Support

Contact: 6282113443806

## License

MIT

---

**Powered by ZylaBot** 🤖
