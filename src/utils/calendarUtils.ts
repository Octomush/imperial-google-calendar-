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

  const startDateTime = new Date(
    `${lecture.date}T${convertTo24Hour(startTime)}`
  );
  const endDateTime = new Date(`${lecture.date}T${convertTo24Hour(endTime)}`);

  const formatDateForGoogle = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const eventDetails = {
    text: lecture.title,
    dates: `${formatDateForGoogle(startDateTime)}/${formatDateForGoogle(
      endDateTime
    )}`,
    details: `Module: ${lecture.module}\nRoom: ${lecture.room}`,
    location: lecture.room,
  };

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    eventDetails.text
  )}&dates=${eventDetails.dates}&details=${encodeURIComponent(
    eventDetails.details
  )}&location=${encodeURIComponent(eventDetails.location)}`;

  window.open(url, "_blank");
};

const convertTo24Hour = (time: string): string => {
  const [timePart, period] = time.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;
};

export const addMultipleToGoogleCalendar = (lectures: Lecture[]) => {
  lectures.forEach((lecture, index) => {
    setTimeout(() => {
      addToGoogleCalendar(lecture);
    }, index * 300);
  });
};

// ICS file generation utilities
const generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const formatDateForICS = (date: Date) => {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

const escapeICSText = (text: string) => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
};

export const generateICSContent = (
  lectures: Lecture[],
  selectedModules: string[] = []
) => {
  const now = new Date();
  const modulesText =
    selectedModules.length > 0 ? ` - ${selectedModules.join(", ")}` : "";

  let icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Imperial College London//Calendar Export//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Imperial College${modulesText}`,
    "X-WR-TIMEZONE:Europe/London",
    "X-WR-CALDESC:Imperial College London lecture calendar export",
  ].join("\r\n");

  lectures.forEach((lecture) => {
    const [startTime, endTime] = lecture.time.split(" - ");
    const startDateTime = new Date(
      `${lecture.date}T${convertTo24Hour(startTime)}`
    );
    const endDateTime = new Date(`${lecture.date}T${convertTo24Hour(endTime)}`);

    const uid = generateUID();
    const created = formatDateForICS(now);
    const dtstart = formatDateForICS(startDateTime);
    const dtend = formatDateForICS(endDateTime);

    icsContent +=
      "\r\n" +
      [
        "BEGIN:VEVENT",
        `UID:${uid}@imperial.ac.uk`,
        `DTSTAMP:${created}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${escapeICSText(lecture.title)}`,
        `DESCRIPTION:${escapeICSText(
          `Module: ${lecture.module}\nRoom: ${lecture.room}`
        )}`,
        `LOCATION:${escapeICSText(lecture.room)}`,
        "STATUS:CONFIRMED",
        "TRANSP:OPAQUE",
        "END:VEVENT",
      ].join("\r\n");
  });

  icsContent += "\r\nEND:VCALENDAR";
  return icsContent;
};

export const downloadICSFile = (
  lectures: Lecture[],
  selectedModules: string[] = [],
  filename?: string
) => {
  const icsContent = generateICSContent(lectures, selectedModules);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const modulesText =
    selectedModules.length > 0 ? `_${selectedModules.join("_")}` : "";
  const defaultFilename = `imperial_calendar${modulesText}_${
    new Date().toISOString().split("T")[0]
  }.ics`;
  link.download = filename || defaultFilename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
