import axios from 'axios';
import moment from 'moment-timezone';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  getReminders, addReminder, deleteReminder,
  getSubsReminders, addSubsReminder, deleteSubsReminder,
  getSubsSholat, addSubsSholat, deleteSubsSholat,
  getSubsSleep, addSubsSleep, deleteSubsSleep,
  getSholatSettings, setSholatSettings,
  getPrivateReminders, addPrivateReminder, deletePrivateReminder, 
  getPrivateRemindersByNumber,
  getSubsScheduleChange, addSubsScheduleChange, deleteSubsScheduleChange
} from './lib/database.js';
import { 
  formatSchedule, getNextDay, getDayName, 
  getScheduleForDay, motivationalQuotes 
} from './lib/schedule.js';

dotenv.config();

const BOT_NAME = process.env.BOT_NAME || 'ZylaBot';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Jakarta';

// Fungsi delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Sleep messages
const sleepMessages = [
  "🌙 Waktunya istirahat! Jangan lupa berdoa sebelum tidur ya~",
  "😴 Sudah malam nih, yuk istirahat yang cukup!",
  "🛌 Istirahat yang cukup membuat besok lebih produktif!",
  "⭐ Selamat beristirahat, semoga mimpi indah!",
  "🌃 Jangan begadang ya, kesehatan itu penting!",
  "💤 Tidur yang cukup = Otak fresh di pagi hari!",
  "🌠 Istirahat dulu, besok ada hari yang cerah menanti!"
];

// Rohani messages for sholat reminder
const rohaniMessages = [
  "🕌 Waktu sholat tiba, jangan ditunda-tunda ya!",
  "☪️ Jaga sholatmu, Allah menjaga hidupmu",
  "🤲 Sholat adalah tiang agama, tegakkanlah!",
  "💚 Segera tunaikan kewajiban, jangan sampai terlambat!"
];

// Helper function to get formatted JID
function getJid(number) {
  return number.includes('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;
}

// Main message handler
export async function handleMessage(sock, m) {
  try {
    if (!m.message) return;
    
    const messageType = Object.keys(m.message)[0];
    if (messageType === 'senderKeyDistributionMessage') return;
    
    const body = m.message.conversation || 
                 m.message.extendedTextMessage?.text || 
                 m.message.imageMessage?.caption || 
                 m.message.videoMessage?.caption || '';
    
    const from = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const command = body.trim().toLowerCase();
    const args = body.trim().split(/ +/).slice(1);
    
    console.log(`[${moment().tz(TIMEZONE).format('HH:mm:ss')}] ${sender}: ${body}`);

    // React with loading
    const reactLoading = async () => {
      await sock.sendMessage(from, {
        react: { text: '⏳', key: m.key }
      });
    };

    // React with success
    const reactSuccess = async () => {
      await delay(500);
      await sock.sendMessage(from, {
        react: { text: '✅', key: m.key }
      });
    };

    // Reply function
    const reply = async (text) => {
      await delay(500);
      return await sock.sendMessage(from, { text }, { quoted: m });
    };

    // MENU
    if (command === 'menu') {
      await reactLoading();
      const menuText = `
╔═══════════════════╗
║   *${BOT_NAME}*   
╚═══════════════════╝

📚 *MENU JADWAL*
├ jadwal - Lihat jadwal hari ini
├ jadwalfull - Lihat foto jadwal lengkap
└ 

📝 *MENU REMINDER/CATATAN*
├ addre (judul) | (isi) - Tambah reminder
├ listre - Lihat daftar reminder
├ delre (id) - Hapus reminder
└

🔔 *AUTO REMINDER JADWAL*
├ addsubsre (nomor) - Subscribe reminder
├ listsubsre - List subscriber
├ delsubsre (nomor) - Unsubscribe
├ setsubsre - Atur waktu reminder
├ remindernow - Kirim reminder sekarang
└

🕌 *JADWAL SHOLAT*
├ jadwalsholat - Lihat jadwal sholat
├ setautosholat - Aktifkan auto reminder
├ setkotasholat (kota) - Set kota
├ addsubsholat (nomor) - Subscribe
├ listsubsholat - List subscriber
├ delsubsholat (nomor) - Unsubscribe
└

😴 *PENGINGAT TIDUR*
├ addsubsleep (nomor) - Subscribe
├ listsubsleep - List subscriber
├ delsubsleep (nomor) - Unsubscribe
└

⏰ *REMINDER PRIBADI*
├ privre besok (jam) (pesan)
├ privre nanti (jam) (pesan)
├ privre tanggal (tgl) (jam) (pesan)
├ listprivre - Lihat reminder pribadi
├ delprivre (id) - Hapus reminder
└

📢 *NOTIF GANTI PELAJARAN*
├ addsubsched (nomor) - Subscribe
├ listsubsched - List subscriber
├ delsubsched (nomor) - Unsubscribe
└

_Powered by ${BOT_NAME}_`;
      await reply(menuText);
      await reactSuccess();
      return;
    }

    // JADWAL
    if (command === 'jadwal') {
      await reactLoading();
      const today = moment().tz(TIMEZONE);
      const dayName = getDayName(today.day());
      const scheduleText = formatSchedule(dayName);
      await reply(scheduleText);
      await reactSuccess();
      return;
    }

    // JADWAL FULL (with image)
    if (command === 'jadwalfull') {
      await reactLoading();
      const imagePath = './lib/jadwalxia.png';
      if (fs.existsSync(imagePath)) {
        await delay(500);
        await sock.sendMessage(from, {
          image: fs.readFileSync(imagePath),
          caption: `📅 *Jadwal Lengkap*\n\n_${BOT_NAME}_`
        }, { quoted: m });
        await reactSuccess();
      } else {
        await reply('❌ File jadwal tidak ditemukan!');
      }
      return;
    }

    // ADD REMINDER
    if (command === 'addre') {
      await reactLoading();
      const text = body.split('addre')[1]?.trim();
      if (!text || !text.includes('|')) {
        await reply('❌ Format salah!\nContoh: addre Judul | Isi catatan');
        return;
      }
      const [title, description] = text.split('|').map(s => s.trim());
      const reminder = addReminder(title, description);
      await reply(`✅ Reminder berhasil ditambahkan!\n\n📌 ID: ${reminder.id}\n📝 Judul: ${title}\n📄 Isi: ${description}`);
      await reactSuccess();
      return;
    }

    // LIST REMINDER
    if (command === 'listre') {
      await reactLoading();
      const reminders = getReminders();
      if (reminders.length === 0) {
        await reply('📝 Belum ada reminder yang tersimpan.');
        return;
      }
      let text = '*📝 DAFTAR REMINDER*\n\n';
      reminders.forEach((r, i) => {
        text += `${i + 1}. *ID: ${r.id}*\n`;
        text += `   📌 ${r.title}\n`;
        text += `   📄 ${r.description}\n`;
        text += `   🕐 ${moment(r.createdAt).tz(TIMEZONE).format('DD/MM/YYYY HH:mm')}\n\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE REMINDER
    if (command.startsWith('delre ')) {
      await reactLoading();
      const id = args[0];
      if (!id) {
        await reply('❌ Format salah!\nContoh: delre 123456');
        return;
      }
      const success = deleteReminder(id);
      if (success) {
        await reply(`✅ Reminder dengan ID ${id} berhasil dihapus!`);
        await reactSuccess();
      } else {
        await reply(`❌ Reminder dengan ID ${id} tidak ditemukan!`);
      }
      return;
    }

    // ADD SUBSCRIBER REMINDER
    if (command.startsWith('addsubsre ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: addsubsre 628123456789');
        return;
      }
      const success = addSubsReminder(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil ditambahkan ke subscriber reminder!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} sudah terdaftar!`);
      }
      return;
    }

    // LIST SUBSCRIBER REMINDER
    if (command === 'listsubsre') {
      await reactLoading();
      const subs = getSubsReminders();
      if (subs.length === 0) {
        await reply('📝 Belum ada subscriber reminder.');
        return;
      }
      let text = '*🔔 SUBSCRIBER REMINDER*\n\n';
      subs.forEach((num, i) => {
        text += `${i + 1}. ${num}\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE SUBSCRIBER REMINDER
    if (command.startsWith('delsubsre ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: delsubsre 628123456789');
        return;
      }
      const success = deleteSubsReminder(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil dihapus dari subscriber!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} tidak ditemukan!`);
      }
      return;
    }

    // REMINDER NOW
    if (command === 'remindernow') {
      await reactLoading();
      const now = moment().tz(TIMEZONE);
      const currentHour = now.hour();
      
      if (currentHour >= 18) {
        const tomorrow = getNextDay(getDayName(now.day()));
        const scheduleText = formatSchedule(tomorrow);
        const reminders = getReminders();
        
        let reminderText = '';
        if (reminders.length > 0) {
          reminderText = '\n\n📝 *REMINDER/CATATAN:*\n\n';
          reminders.forEach((r, i) => {
            reminderText += `${i + 1}. ${r.title}\n   ${r.description}\n\n`;
          });
        }
        
        const fullText = `🔔 *REMINDER MALAM INI*\n\n${scheduleText}${reminderText}\n_${BOT_NAME}_`;
        await reply(fullText);
        await reactSuccess();
      } else {
        await reply('⏰ Reminder hanya bisa dikirim setelah jam 18:00!');
      }
      return;
    }

    // JADWAL SHOLAT
    if (command === 'jadwalsholat') {
      await reactLoading();
      try {
        const settings = getSholatSettings();
        const today = moment().tz(TIMEZONE).format('YYYY-MM-DD');
        const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${settings.cityId}/${today}`);
        
        if (response.data.status) {
          const jadwal = response.data.data.jadwal;
          const text = `
🕌 *JADWAL SHOLAT*
📍 ${response.data.data.lokasi}
📅 ${jadwal.tanggal}

🌅 Subuh: ${jadwal.subuh}
🌄 Terbit: ${jadwal.terbit}
🌞 Dhuha: ${jadwal.dhuha}
☀️ Dzuhur: ${jadwal.dzuhur}
🌤️ Ashar: ${jadwal.ashar}
🌆 Maghrib: ${jadwal.maghrib}
🌙 Isya: ${jadwal.isya}

_${BOT_NAME}_`;
          await reply(text);
          await reactSuccess();
        }
      } catch (error) {
        await reply('❌ Gagal mengambil jadwal sholat!');
        console.error(error);
      }
      return;
    }

    // SET KOTA SHOLAT
    if (command.startsWith('setkotasholat ')) {
      await reactLoading();
      const kota = args.join(' ');
      if (!kota) {
        await reply('❌ Format salah!\nContoh: setkotasholat kediri');
        return;
      }
      
      try {
        const response = await axios.get(`https://api.myquran.com/v2/sholat/kota/cari/${kota}`);
        if (response.data.status && response.data.data.length > 0) {
          let text = '🔍 *HASIL PENCARIAN KOTA*\n\n';
          response.data.data.forEach((city, i) => {
            text += `${i + 1}. ${city.lokasi} (ID: ${city.id})\n`;
          });
          text += '\n_Gunakan ID untuk set kota_\n_Contoh: setkotasholat 1632_';
          await reply(text);
          await reactSuccess();
        } else {
          await reply('❌ Kota tidak ditemukan!');
        }
      } catch (error) {
        // Jika input adalah ID langsung
        const cityId = args[0];
        setSholatSettings(cityId, kota);
        await reply(`✅ Kota berhasil diset!\nID: ${cityId}`);
        await reactSuccess();
      }
      return;
    }

    // ADD SUBSCRIBER SHOLAT
    if (command.startsWith('addsubsholat ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: addsubsholat 628123456789');
        return;
      }
      const success = addSubsSholat(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil subscribe reminder sholat!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} sudah terdaftar!`);
      }
      return;
    }

    // LIST SUBSCRIBER SHOLAT
    if (command === 'listsubsholat') {
      await reactLoading();
      const subs = getSubsSholat();
      if (subs.length === 0) {
        await reply('📝 Belum ada subscriber sholat.');
        return;
      }
      let text = '*🕌 SUBSCRIBER SHOLAT*\n\n';
      subs.forEach((num, i) => {
        text += `${i + 1}. ${num}\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE SUBSCRIBER SHOLAT
    if (command.startsWith('delsubsholat ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: delsubsholat 628123456789');
        return;
      }
      const success = deleteSubsSholat(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil unsubscribe!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} tidak ditemukan!`);
      }
      return;
    }

    // ADD SUBSCRIBER SLEEP
    if (command.startsWith('addsubsleep ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: addsubsleep 628123456789');
        return;
      }
      const success = addSubsSleep(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil subscribe pengingat tidur!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} sudah terdaftar!`);
      }
      return;
    }

    // LIST SUBSCRIBER SLEEP
    if (command === 'listsubsleep') {
      await reactLoading();
      const subs = getSubsSleep();
      if (subs.length === 0) {
        await reply('📝 Belum ada subscriber tidur.');
        return;
      }
      let text = '*😴 SUBSCRIBER TIDUR*\n\n';
      subs.forEach((num, i) => {
        text += `${i + 1}. ${num}\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE SUBSCRIBER SLEEP
    if (command.startsWith('delsubsleep ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: delsubsleep 628123456789');
        return;
      }
      const success = deleteSubsSleep(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil unsubscribe!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} tidak ditemukan!`);
      }
      return;
    }

    // PRIVATE REMINDER
    if (command.startsWith('privre ')) {
      await reactLoading();
      const text = body.split('privre')[1]?.trim();
      if (!text) {
        await reply('❌ Format salah!\n\nContoh:\n- privre besok 15:50 Belajar matematika\n- privre nanti 14:30 Meeting\n- privre tanggal 15 14:50 Ulangan');
        return;
      }

      const senderNumber = sender.split('@')[0];
      const now = moment().tz(TIMEZONE);
      let targetDate;

      if (text.startsWith('besok ')) {
        const timeText = text.split('besok')[1].trim();
        const [time, ...messageArr] = timeText.split(' ');
        const message = messageArr.join(' ');
        
        if (!time.includes(':') || !message) {
          await reply('❌ Format salah! Contoh: privre besok 15:50 Pesan reminder');
          return;
        }

        const [hour, minute] = time.split(':');
        targetDate = moment().tz(TIMEZONE).add(1, 'day').hour(hour).minute(minute).second(0);
        
        addPrivateReminder(senderNumber, message, targetDate);
        await reply(`✅ Reminder berhasil dibuat!\n\n⏰ ${targetDate.format('DD/MM/YYYY HH:mm')}\n📝 ${message}`);
        await reactSuccess();
      } 
      else if (text.startsWith('nanti ')) {
        const timeText = text.split('nanti')[1].trim();
        const [time, ...messageArr] = timeText.split(' ');
        const message = messageArr.join(' ');
        
        if (!time.includes(':') || !message) {
          await reply('❌ Format salah! Contoh: privre nanti 14:30 Pesan reminder');
          return;
        }

        const [hour, minute] = time.split(':');
        targetDate = moment().tz(TIMEZONE).hour(hour).minute(minute).second(0);
        
        // Jika waktu sudah lewat hari ini, set untuk besok
        if (targetDate.isBefore(now)) {
          targetDate.add(1, 'day');
        }
        
        addPrivateReminder(senderNumber, message, targetDate);
        await reply(`✅ Reminder berhasil dibuat!\n\n⏰ ${targetDate.format('DD/MM/YYYY HH:mm')}\n📝 ${message}`);
        await reactSuccess();
      }
      else if (text.startsWith('tanggal ')) {
        const dateText = text.split('tanggal')[1].trim();
        const parts = dateText.split(' ');
        
        if (parts.length < 3) {
          await reply('❌ Format salah! Contoh: privre tanggal 15 14:50 Pesan reminder');
          return;
        }

        const date = parseInt(parts[0]);
        const time = parts[1];
        const message = parts.slice(2).join(' ');
        
        if (!time.includes(':') || !message) {
          await reply('❌ Format salah! Contoh: privre tanggal 15 14:50 Pesan reminder');
          return;
        }

        const [hour, minute] = time.split(':');
        targetDate = moment().tz(TIMEZONE).date(date).hour(hour).minute(minute).second(0);
        
        // Jika tanggal sudah lewat bulan ini, set untuk bulan depan
        if (targetDate.isBefore(now)) {
          targetDate.add(1, 'month');
        }
        
        addPrivateReminder(senderNumber, message, targetDate);
        await reply(`✅ Reminder berhasil dibuat!\n\n⏰ ${targetDate.format('DD/MM/YYYY HH:mm')}\n📝 ${message}`);
        await reactSuccess();
      }
      return;
    }

    // LIST PRIVATE REMINDER
    if (command === 'listprivre') {
      await reactLoading();
      const senderNumber = sender.split('@')[0];
      const reminders = getPrivateRemindersByNumber(senderNumber);
      
      if (reminders.length === 0) {
        await reply('📝 Kamu belum memiliki reminder pribadi.');
        return;
      }

      let text = '*⏰ REMINDER PRIBADI*\n\n';
      reminders.forEach((r, i) => {
        const date = moment(r.datetime).tz(TIMEZONE);
        text += `${i + 1}. *ID: ${r.id}*\n`;
        text += `   ⏰ ${date.format('DD/MM/YYYY HH:mm')}\n`;
        text += `   📝 ${r.message}\n\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE PRIVATE REMINDER
    if (command.startsWith('delprivre ')) {
      await reactLoading();
      const id = args[0];
      const senderNumber = sender.split('@')[0];
      
      if (!id) {
        await reply('❌ Format salah! Contoh: delprivre 123456');
        return;
      }

      const success = deletePrivateReminder(senderNumber, id);
      if (success) {
        await reply(`✅ Reminder dengan ID ${id} berhasil dihapus!`);
        await reactSuccess();
      } else {
        await reply(`❌ Reminder dengan ID ${id} tidak ditemukan!`);
      }
      return;
    }

    // ADD SUBSCRIBER SCHEDULE CHANGE
    if (command.startsWith('addsubsched ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: addsubsched 628123456789');
        return;
      }
      const success = addSubsScheduleChange(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil subscribe notif ganti pelajaran!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} sudah terdaftar!`);
      }
      return;
    }

    // LIST SUBSCRIBER SCHEDULE CHANGE
    if (command === 'listsubsched') {
      await reactLoading();
      const subs = getSubsScheduleChange();
      if (subs.length === 0) {
        await reply('📝 Belum ada subscriber ganti pelajaran.');
        return;
      }
      let text = '*📢 SUBSCRIBER GANTI PELAJARAN*\n\n';
      subs.forEach((num, i) => {
        text += `${i + 1}. ${num}\n`;
      });
      await reply(text);
      await reactSuccess();
      return;
    }

    // DELETE SUBSCRIBER SCHEDULE CHANGE
    if (command.startsWith('delsubsched ')) {
      await reactLoading();
      const number = args[0]?.replace(/[^0-9]/g, '');
      if (!number) {
        await reply('❌ Format salah!\nContoh: delsubsched 628123456789');
        return;
      }
      const success = deleteSubsScheduleChange(number);
      if (success) {
        await reply(`✅ Nomor ${number} berhasil unsubscribe!`);
        await reactSuccess();
      } else {
        await reply(`❌ Nomor ${number} tidak ditemukan!`);
      }
      return;
    }

  } catch (error) {
    console.error('Error handling message:', error);
  }
}

// Export helper functions
export {
  getJid,
  sleepMessages,
  rohaniMessages,
  delay,
  BOT_NAME,
  TIMEZONE
};
