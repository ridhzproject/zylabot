export const schedules = {
  senin: [
    { time: '06:45-07:30', subject: 'Upacara' },
    { time: '07:30-08:15', subject: 'PKWU' },
    { time: '08:15-09:00', subject: 'PKWU' },
    { time: '09:00-09:25', subject: 'Istirahat/Sholat Dhuha' },
    { time: '09:25-10:10', subject: 'Matematika' },
    { time: '10:10-10:55', subject: 'Matematika' },
    { time: '10:55-11:40', subject: 'Matematika(TL)' },
    { time: '11:40-12:25', subject: 'Matematika(TL)' },
    { time: '12:25-12:50', subject: 'Istirahat/Sholat Dzuhur' },
    { time: '12:50-13:35', subject: 'Biologi(TL)' },
    { time: '13:35-14:20', subject: 'Biologi(TL)' },
    { time: '14:20-15:05', subject: 'Bahasa Indonesia' },
    { time: '15:05-15:50', subject: 'Bahasa Indonesia' }
  ],
  selasa: [
    { time: '06:45-07:30', subject: 'PPKn' },
    { time: '07:30-08:15', subject: 'PPKn' },
    { time: '08:15-09:00', subject: 'Matematika' },
    { time: '09:00-09:25', subject: 'Istirahat/Sholat Dhuha' },
    { time: '09:25-10:10', subject: 'Matematika' },
    { time: '10:10-10:55', subject: 'Biologi(TL)' },
    { time: '10:55-11:40', subject: 'Biologi(TL)' },
    { time: '11:40-12:25', subject: 'Biologi(TL)' },
    { time: '12:25-12:50', subject: 'Istirahat/Sholat Dzuhur' },
    { time: '12:50-13:35', subject: 'Bahasa Indonesia' },
    { time: '13:35-14:20', subject: 'Bahasa Indonesia' },
    { time: '14:20-15:05', subject: 'Matematika(TL)' },
    { time: '15:05-15:50', subject: 'Matematika(TL)' }
  ],
  rabu: [
    { time: '06:45-07:30', subject: 'Fisika(TL)' },
    { time: '07:30-08:15', subject: 'Fisika(TL)' },
    { time: '08:15-09:00', subject: 'Fisika(TL)' },
    { time: '09:00-09:25', subject: 'Istirahat/Sholat Dhuha' },
    { time: '09:25-10:10', subject: 'PAI' },
    { time: '10:10-10:55', subject: 'PAI' },
    { time: '10:55-11:40', subject: 'PAI' },
    { time: '11:40-12:25', subject: 'Matematika(TL)' },
    { time: '12:25-12:50', subject: 'Istirahat/Sholat Dzuhur' },
    { time: '12:50-13:35', subject: 'Kimia(TL)' },
    { time: '13:35-14:20', subject: 'Kimia(TL)' },
    { time: '14:20-15:05', subject: 'Sejarah' },
    { time: '15:05-15:50', subject: 'Sejarah' }
  ],
  kamis: [
    { time: '06:45-07:30', subject: 'Kimia(TL)' },
    { time: '07:30-08:15', subject: 'Kimia(TL)' },
    { time: '08:15-09:00', subject: 'Kimia(TL)' },
    { time: '09:00-09:25', subject: 'Istirahat/Sholat Dhuha' },
    { time: '09:25-10:10', subject: 'PJOK' },
    { time: '10:10-10:55', subject: 'PJOK' },
    { time: '10:55-11:40', subject: 'Bahasa Inggris' },
    { time: '11:40-12:25', subject: 'Bahasa Inggris' },
    { time: '12:25-12:50', subject: 'Istirahat/Sholat Dzuhur' },
    { time: '12:50-13:35', subject: 'Bahasa Inggris' },
    { time: '13:35-14:20', subject: 'PJOK' },
    { time: '14:20-15:05', subject: 'Seni Budaya' },
    { time: '15:05-15:50', subject: 'Seni Budaya' }
  ],
  jumat: [
    { time: '06:45-07:30', subject: 'Bahasa Jawa' },
    { time: '07:30-08:15', subject: 'Bahasa Jawa' },
    { time: '08:15-09:00', subject: 'Bimbingan Konseling' },
    { time: '09:00-09:30', subject: 'Istirahat/Sholat Dhuha' },
    { time: '09:30-10:15', subject: 'Fisika(TL)' },
    { time: '10:15-11:00', subject: 'Fisika(TL)' }
  ],
  sabtu: [],
  minggu: []
};

export function getScheduleForDay(day) {
  const dayLower = day.toLowerCase();
  if (schedules[dayLower]) {
    return schedules[dayLower];
  }
  return [];
}

export function formatSchedule(day) {
  const schedule = getScheduleForDay(day);
  
  if (schedule.length === 0) {
    return `📅 *Jadwal ${day.charAt(0).toUpperCase() + day.slice(1)}*\n\n🎉 *LIBUR*`;
  }
  
  let text = `📅 *Jadwal ${day.charAt(0).toUpperCase() + day.slice(1)}*\n\n`;
  
  schedule.forEach((item, index) => {
    text += `${index + 1}. ${item.time} = ${item.subject}\n`;
  });
  
  return text;
}

export function getNextDay(currentDay) {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  const currentIndex = days.indexOf(currentDay.toLowerCase());
  const nextIndex = (currentIndex + 1) % 7;
  return days[nextIndex];
}

export function getDayName(dayNumber) {
  const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
  return days[dayNumber];
}

export const motivationalQuotes = [
  "💪 Semangat belajar! Ilmu adalah investasi terbaik.",
  "🌟 Kesuksesan dimulai dari usaha hari ini!",
  "📚 Belajar dengan ikhlas, hasilnya akan luar biasa!",
  "✨ Jangan menyerah, setiap usaha ada hasilnya!",
  "🎯 Fokus pada tujuanmu, raih impianmu!",
  "🚀 Hari ini lebih baik dari kemarin!",
  "💡 Ilmu yang bermanfaat adalah cahaya hidup!",
  "🌈 Tetap semangat, masa depan cerah menanti!"
];
