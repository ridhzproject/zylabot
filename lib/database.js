import fs from 'fs';
import path from 'path';

const DB_PATH = './data';
const FILES = {
  reminders: path.join(DB_PATH, 'reminders.json'),
  subsReminders: path.join(DB_PATH, 'subs_reminders.json'),
  subsSholat: path.join(DB_PATH, 'subs_sholat.json'),
  subsSleep: path.join(DB_PATH, 'subs_sleep.json'),
  sholatSettings: path.join(DB_PATH, 'sholat_settings.json'),
  privateReminders: path.join(DB_PATH, 'private_reminders.json'),
  subsScheduleChange: path.join(DB_PATH, 'subs_schedule_change.json')
};

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize files if they don't exist
Object.values(FILES).forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]));
  }
});

// Read data from file
function readData(key) {
  try {
    const data = fs.readFileSync(FILES[key], 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return [];
  }
}

// Write data to file
function writeData(key, data) {
  try {
    fs.writeFileSync(FILES[key], JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    return false;
  }
}

// REMINDERS (TUGAS/CATATAN)
export function getReminders() {
  return readData('reminders');
}

export function addReminder(title, description) {
  const reminders = getReminders();
  const newReminder = {
    id: Date.now(),
    title,
    description,
    createdAt: new Date().toISOString()
  };
  reminders.push(newReminder);
  writeData('reminders', reminders);
  return newReminder;
}

export function deleteReminder(id) {
  const reminders = getReminders();
  const filtered = reminders.filter(r => r.id !== parseInt(id));
  writeData('reminders', filtered);
  return reminders.length !== filtered.length;
}

// SUBSCRIBERS REMINDERS
export function getSubsReminders() {
  return readData('subsReminders');
}

export function addSubsReminder(number) {
  const subs = getSubsReminders();
  if (!subs.includes(number)) {
    subs.push(number);
    writeData('subsReminders', subs);
    return true;
  }
  return false;
}

export function deleteSubsReminder(number) {
  const subs = getSubsReminders();
  const filtered = subs.filter(n => n !== number);
  writeData('subsReminders', filtered);
  return subs.length !== filtered.length;
}

// SUBSCRIBERS SHOLAT
export function getSubsSholat() {
  return readData('subsSholat');
}

export function addSubsSholat(number) {
  const subs = getSubsSholat();
  if (!subs.includes(number)) {
    subs.push(number);
    writeData('subsSholat', subs);
    return true;
  }
  return false;
}

export function deleteSubsSholat(number) {
  const subs = getSubsSholat();
  const filtered = subs.filter(n => n !== number);
  writeData('subsSholat', filtered);
  return subs.length !== filtered.length;
}

// SUBSCRIBERS SLEEP
export function getSubsSleep() {
  return readData('subsSleep');
}

export function addSubsSleep(number) {
  const subs = getSubsSleep();
  if (!subs.includes(number)) {
    subs.push(number);
    writeData('subsSleep', subs);
    return true;
  }
  return false;
}

export function deleteSubsSleep(number) {
  const subs = getSubsSleep();
  const filtered = subs.filter(n => n !== number);
  writeData('subsSleep', filtered);
  return subs.length !== filtered.length;
}

// SHOLAT SETTINGS
export function getSholatSettings() {
  const settings = readData('sholatSettings');
  return settings.length > 0 ? settings[0] : { cityId: '1615', cityName: 'TUBAN' };
}

export function setSholatSettings(cityId, cityName) {
  writeData('sholatSettings', [{ cityId, cityName }]);
  return true;
}

// PRIVATE REMINDERS
export function getPrivateReminders() {
  return readData('privateReminders');
}

export function addPrivateReminder(number, message, datetime) {
  const reminders = getPrivateReminders();
  const newReminder = {
    id: Date.now(),
    number,
    message,
    datetime: datetime.toISOString(),
    createdAt: new Date().toISOString()
  };
  reminders.push(newReminder);
  writeData('privateReminders', reminders);
  return newReminder;
}

export function deletePrivateReminder(number, id) {
  const reminders = getPrivateReminders();
  const filtered = reminders.filter(r => !(r.number === number && r.id === parseInt(id)));
  writeData('privateReminders', filtered);
  return reminders.length !== filtered.length;
}

export function getPrivateRemindersByNumber(number) {
  const reminders = getPrivateReminders();
  return reminders.filter(r => r.number === number);
}

export function deleteExpiredPrivateReminders() {
  const reminders = getPrivateReminders();
  const now = new Date();
  const filtered = reminders.filter(r => new Date(r.datetime) > now);
  writeData('privateReminders', filtered);
}

// SUBSCRIBERS SCHEDULE CHANGE
export function getSubsScheduleChange() {
  return readData('subsScheduleChange');
}

export function addSubsScheduleChange(number) {
  const subs = getSubsScheduleChange();
  if (!subs.includes(number)) {
    subs.push(number);
    writeData('subsScheduleChange', subs);
    return true;
  }
  return false;
}

export function deleteSubsScheduleChange(number) {
  const subs = getSubsScheduleChange();
  const filtered = subs.filter(n => n !== number);
  writeData('subsScheduleChange', filtered);
  return subs.length !== filtered.length;
}
