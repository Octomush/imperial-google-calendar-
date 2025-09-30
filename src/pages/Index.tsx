import { ModuleInfo } from "@/ModuleTypes";
import { ModuleSelector } from "@/components/ModuleSelector";
import { Button } from "@/components/ui/button";
import computingData from "@/computing.json";
import {
  addMultipleToGoogleCalendar,
  downloadICSFile,
} from "@/utils/calendarUtils";
import { CalendarPlus, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
interface Lecture {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
  module: string;
}

// Transform computing.json data to Lecture format
const transformModuleInfoToLecture = (
  moduleInfo: ModuleInfo,
  dayName: string,
  week: number
): Lecture => {
  // Convert week number to actual date (assuming week 1 starts on a specific date)
  // This is a simplified conversion - you may need to adjust based on your academic calendar
  const baseDate = new Date("2025-10-06"); // Adjust this to your term start date
  const weekOffset = (week - 1) * 7;
  const dayOffset = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ].indexOf(dayName);

  const lectureDate = new Date(baseDate);
  lectureDate.setDate(lectureDate.getDate() + weekOffset + dayOffset);

  // Convert time interval to readable format
  const formatTime = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  const startTime = formatTime(moduleInfo.time.start);
  const endTime = formatTime(moduleInfo.time.end);

  return {
    id: moduleInfo.id,
    title: `${moduleInfo.module} - ${moduleInfo.event_category}`,
    date: lectureDate.toISOString().split("T")[0],
    time: `${startTime} - ${endTime}`,
    room: moduleInfo.location,
    module: moduleInfo.module,
  };
};

// Extract all modules from computing data and organize by module name
const getModulesFromComputingData = () => {
  const moduleMap: Record<string, Lecture[]> = {};

  Object.entries(computingData).forEach(([dayName, dayModules]) => {
    dayModules.forEach((moduleInfo: ModuleInfo) => {
      const lecture = transformModuleInfoToLecture(
        moduleInfo,
        dayName,
        moduleInfo.week
      );
      const moduleKey = moduleInfo.module
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      if (!moduleMap[moduleKey]) {
        moduleMap[moduleKey] = [];
      }
      moduleMap[moduleKey].push(lecture);
    });
  });

  return moduleMap;
};

const Index = () => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [signedInUser, setSignedInUser] = useState<any>(null);

  // Get all available modules from computing data
  const availableModules = useMemo(() => getModulesFromComputingData(), []);

  // Create module list for selector
  const moduleOptions = useMemo(() => {
    return Object.keys(availableModules)
      .map((moduleKey) => {
        // Get a sample lecture to extract the clean module name
        const sampleLecture = availableModules[moduleKey][0];
        const cleanName = sampleLecture?.module || moduleKey;
        return {
          id: moduleKey,
          name: cleanName,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [availableModules]);

  // Aggregate lectures from all selected modules
  const lectures = useMemo(() => {
    return selectedModules
      .flatMap((moduleId) => availableModules[moduleId] || [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedModules, availableModules]);

  const handleSignInSuccess = (user: any) => {
    setSignedInUser(user);
    console.log("User signed in:", user);
  };

  const handleSignInError = (error: any) => {
    console.error("Sign-in error:", error);
    setSignedInUser(null);
  };

  const handleAddAllToCalendar = () => {
    if (lectures.length === 0) {
      toast.error("No lectures to add");
      return;
    }

    if (!signedInUser) {
      toast.error(
        "Please sign in with Google first to add events to your calendar"
      );
      return;
    }

    addMultipleToGoogleCalendar(lectures);
    toast.success(
      `All ${lectures.length} lecture${
        lectures.length !== 1 ? "s" : ""
      } added to calendar!`
    );
  };

  const handleDownloadICS = () => {
    if (lectures.length === 0) {
      toast.error("No lectures to download");
      return;
    }

    try {
      downloadICSFile(lectures, selectedModules);
      toast.success(
        `Calendar file downloaded with ${lectures.length} lecture${
          lectures.length !== 1 ? "s" : ""
        }!`
      );
    } catch (error) {
      console.error("Error downloading ICS file:", error);
      toast.error("Failed to download calendar file");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Imperial Computing Timetable
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Add your lecture schedule to Google Calendar
          </p>

          {/* Google Sign-In Component */}
          {/* <div className="max-w-md mx-auto mb-8">
            <GoogleSignIn
              onSignInSuccess={handleSignInSuccess}
              onSignInError={handleSignInError}
            />
          </div> */}
        </header>

        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Select Modules
          </label>
          <ModuleSelector
            value={selectedModules}
            onChange={setSelectedModules}
            availableModules={moduleOptions}
          />
        </div>

        {selectedModules.length > 0 && (
          <div className="text-center space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
              <p className="text-lg font-medium text-foreground mb-2">
                Ready to add {lectures.length} lecture
                {lectures.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                From {selectedModules.length} selected module
                {selectedModules.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Add to Google Calendar or download an .ics file for any calendar
                app
              </p>
              {/* {!signedInUser && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                  ⚠️ Please sign in with Google to add events to your calendar
                </p>
              )} */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddAllToCalendar}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  disabled={!signedInUser}
                >
                  <CalendarPlus className="mr-2 h-5 w-5" />
                  Add to Calendar
                </Button>
                <Button
                  onClick={handleDownloadICS}
                  variant="outline"
                  size="lg"
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground shadow-lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download .ics File
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Select modules to add their lectures to your calendar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
