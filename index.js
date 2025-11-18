import makeWASocket, { 
  DisconnectReason, 
  useMultiFileAuthState,
  makeInMemoryStore,
  fetchLatestBaileysVersion 
} from '@fuxxy-star/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import cron from 'node-cron';
import moment from 'moment-timezone';
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

import { handleMessage, getJid, sleepMessages, rohaniMessages, delay, BOT_NAME, TIMEZONE } from './main.js';
import {
  getReminders,
  getSubsReminders,
  getSubsSholat,
  getSubsSleep,
  getSholatSettings,
  getPrivateReminders,
  deleteExpiredPrivateReminders,
  getSubsScheduleChange
} from './lib/database.js';
import { 
  formatSchedule, 
  getNextDay, 
  getDayName, 
  getScheduleForDay,
  motivationalQuotes 
} from './lib/schedule.js';

dotenv.config();

const logger = pino({ level: 'silent' });
const store = makeInMemoryStore({ logger });

store?.readFromFile('./baileys_store.json');
setInterval(() => {
  store?.writeToFile('./baileys_store.json');
}, 10_000);

let sock;
let saveCreds;

// Connect to WhatsApp
async function connectToWhatsApp() {
  const { state, saveCreds: save } = await useMultiFileAuthState('auth_info_baileys');
  saveCreds = save;

  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    auth: state,
    browser: ['ZylaBot', 'Chrome', '110.0.0'],
    markOnlineOnConnect: false,
  });

  store?.bind(sock.ev);

  // Pairing Code
  if (!sock.authState.creds.registered) {
    const pairingCode = process.env.PAIRING_CODE || 'ZYLAON12';
    const phoneNumber = process.env.BOT_NUMBER?.replace(/[^0-9]/g, '');
    
    if (!phoneNumber) {
      console.log('❌ BOT_NUMBER tidak ditemukan di .env!');
      process.exit(1);
    }

    console.log('📱 Requesting pairing code...');
    const code = await sock.requestPairingCode(phoneNumber, pairingCode);
    console.log(`✅ Pairing Code: ${code}`);
  }

  // Connection update
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      const shouldReconnect = 
        (lastDisconnect?.error instanceof Boom)
          ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
          : true;
      
      console.log('❌ Connection closed:', lastDisconnect?.error);
      
      if (shouldReconnect) {
        console.log('🔄 Reconnecting...');
        setTimeout(connectToWhatsApp, 5000);
      }
    } else if (connection === 'open') {
      console.log('✅ Connected to WhatsApp!');
      console.log(`🤖 Bot: ${BOT_NAME}`);
      console.log(`📱 Number: ${process.env.BOT_NUMBER}`);
    }
  });

  // Save credentials
  sock.ev.on('creds.update', saveCreds);

  // Handle messages
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const m of messages) {
      if (!m.message || m.key.fromMe) continue;
      await handleMessage(sock, m);
    }
  });
}

// AUTO REMINDER JADWAL (18:45)
cron.schedule('45 18 * * *', async () => {
  console.log('🔔 Running auto reminder...');
  
  const now = moment().tz(TIMEZONE);
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
  
  const subscribers = getSubsReminders();
  for (const number of subscribers) {
    try {
      await sock.sendMessage(getJid(number), { text: fullText });
      await delay(2000);
    } catch (error) {
      console.error(`Error sending to ${number}:`, error);
    }
  }
}, {
  timezone: TIMEZONE
});

// AUTO SHOLAT REMINDER
async function setupSholatReminders() {
  const settings = getSholatSettings();
  const today = moment().tz(TIMEZONE).format('YYYY-MM-DD');
  
  try {
    const response = await axios.get(`https://api.myquran.com/v2/sholat/jadwal/${settings.cityId}/${today}`);
    
    if (response.data.status) {
      const jadwal = response.data.data.jadwal;
      const prayerTimes = [
        { name: 'Subuh', time: jadwal.subuh },
        { name: 'Dzuhur', time: jadwal.dzuhur },
        { name: 'Ashar', time: jadwal.ashar },
        { name: 'Maghrib', time: jadwal.maghrib },
        { name: 'Isya', time: jadwal.isya }
      ];

      prayerTimes.forEach(prayer => {
        const [hour, minute] = prayer.time.split(':');
        cron.schedule(`${minute} ${hour} * * *`, async () => {
          console.log(`🕌 Sending ${prayer.name} reminder...`);
          
          const message = `${rohaniMessages[Math.floor(Math.random() * rohaniMessages.length)]}\n\n🕌 *Waktu ${prayer.name}*\n⏰ ${prayer.time}\n\n_${BOT_NAME}_`;
          
          const subscribers = getSubsSholat();
          for (const number of subscribers) {
            try {
              await sock.sendMessage(getJid(number), { text: message });
              await delay(2000);
            } catch (error) {
              console.error(`Error sending to ${number}:`, error);
            }
          }
        }, {
          timezone: TIMEZONE
        });
      });

      console.log('✅ Sholat reminders setup complete!');
    }
  } catch (error) {
    console.error('Error setting up sholat reminders:', error);
  }
}

// AUTO SLEEP REMINDER (21:00 - 21:35)
const sleepMinute = Math.floor(Math.random() * 36); // Random between 0-35
cron.schedule(`${sleepMinute} 21 * * *`, async () => {
  console.log('😴 Sending sleep reminder...');
  
  const message = `${sleepMessages[Math.floor(Math.random() * sleepMessages.length)]}\n\n🤲 *Doa Tidur:*\n"Bismika Allahumma ahya wa bismika amut"\n(Dengan nama-Mu ya Allah aku hidup dan dengan nama-Mu aku mati)\n\n_${BOT_NAME}_`;
  
  const subscribers = getSubsSleep();
  for (const number of subscribers) {
    try {
      await sock.sendMessage(getJid(number), { text: message });
      await delay(2000);
    } catch (error) {
      console.error(`Error sending to ${number}:`, error);
    }
  }
}, {
  timezone: TIMEZONE
});

// PRIVATE REMINDERS CHECKER (setiap menit)
cron.schedule('* * * * *', async () => {
  const now = moment().tz(TIMEZONE);
  const reminders = getPrivateReminders();
  
  for (const reminder of reminders) {
    const reminderTime = moment(reminder.datetime).tz(TIMEZONE);
    
    // Cek jika sudah waktunya (dalam rentang 1 menit)
    if (reminderTime.isSameOrBefore(now) && reminderTime.isAfter(now.clone().subtract(1, 'minute'))) {
      try {
        const message = `⏰ *REMINDER PRIBADI*\n\n📝 ${reminder.message}\n\n_${BOT_NAME}_`;
        await sock.sendMessage(getJid(reminder.number), { text: message });
        console.log(`✅ Sent private reminder to ${reminder.number}`);
        await delay(1000);
      } catch (error) {
        console.error(`Error sending private reminder to ${reminder.number}:`, error);
      }
    }
  }
  
  // Hapus reminder yang sudah lewat
  deleteExpiredPrivateReminders();
}, {
  timezone: TIMEZONE
});

// AUTO SCHEDULE CHANGE NOTIFICATION
async function setupScheduleChangeNotifications() {
  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
  
  days.forEach(day => {
    const schedule = getScheduleForDay(day);
    
    schedule.forEach((lesson, index) => {
      // Skip istirahat
      if (lesson.subject.includes('Istirahat')) return;
      
      const [startTime] = lesson.time.split('-');
      const [hour, minute] = startTime.split(':');
      
      // Kirim notifikasi 2 menit sebelum ganti pelajaran
      const notifMinute = parseInt(minute) - 2;
      const notifHour = notifMinute < 0 ? parseInt(hour) - 1 : parseInt(hour);
      const finalMinute = notifMinute < 0 ? 60 + notifMinute : notifMinute;
      
      // Cek hari dalam seminggu (1=Senin, 5=Jumat)
      const dayOfWeek = days.indexOf(day) + 1;
      
      cron.schedule(`${finalMinute} ${notifHour} * * ${dayOfWeek}`, async () => {
        const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        const nextLesson = schedule[index + 1];
        
        let message = `📢 *GANTI PELAJARAN*\n\n${quote}\n\n`;
        message += `⏰ Sekarang: ${startTime}\n`;
        message += `📚 ${lesson.subject}\n\n`;
        
        if (nextLesson && !nextLesson.subject.includes('Istirahat')) {
          message += `⏭️ Selanjutnya: ${nextLesson.time}\n`;
          message += `📖 ${nextLesson.subject}\n\n`;
        }
        
        message += `_${BOT_NAME}_`;
        
        const subscribers = getSubsScheduleChange();
        for (const number of subscribers) {
          try {
            await sock.sendMessage(getJid(number), { text: message });
            await delay(2000);
          } catch (error) {
            console.error(`Error sending to ${number}:`, error);
          }
        }
      }, {
        timezone: TIMEZONE
      });
    });
  });
  
  console.log('✅ Schedule change notifications setup complete!');
}

// Start bot
connectToWhatsApp().then(() => {
  console.log('🚀 Bot started successfully!');
  
  // Setup auto features after connection
  setTimeout(() => {
    setupSholatReminders();
    setupScheduleChangeNotifications();
  }, 5000);
});
