interface Lecture {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
  module: string;
}

export const addToGoogleCalendar = (lecture: Lecture) => {
  const [startTime, endTime] = lecture.time.split(" - ");
  const dateObj = new Date(lecture.date);
  
  const startDateTime = new Date(`${lecture.date}T${convertTo24Hour(startTime)}`);
  const endDateTime = new Date(`${lecture.date}T${convertTo24Hour(endTime)}`);
  
  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const eventDetails = {
    text: lecture.title,
    dates: `${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(endDateTime)}`,
    details: `Module: ${lecture.module}\nRoom: ${lecture.room}`,
    location: lecture.room,
  };
  
  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}&location=${encodeURIComponent(eventDetails.location)}`;
  
  window.open(url, '_blank');
};

const convertTo24Hour = (time: string): string => {
  const [timePart, period] = time.split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
};

export const addMultipleToGoogleCalendar = (lectures: Lecture[]) => {
  lectures.forEach((lecture, index) => {
    setTimeout(() => {
      addToGoogleCalendar(lecture);
    }, index * 300);
  });
};
