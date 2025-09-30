import GoogleSignIn from "@/components/GoogleSignIn";
import { ModuleSelector } from "@/components/ModuleSelector";
import { Button } from "@/components/ui/button";
import { addMultipleToGoogleCalendar } from "@/utils/calendarUtils";
import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
interface Lecture {
  id: string;
  title: string;
  date: string;
  time: string;
  room: string;
  module: string;
}

const mockLectures: Record<string, Lecture[]> = {
  algorithms: [
    {
      id: "1",
      title: "Algorithms Lecture 1",
      date: "2025-10-06",
      time: "10:00 AM - 12:00 PM",
      room: "Huxley 340",
      module: "Algorithms",
    },
    {
      id: "2",
      title: "Algorithms Lecture 2",
      date: "2025-10-08",
      time: "2:00 PM - 4:00 PM",
      room: "Huxley 340",
      module: "Algorithms",
    },
    {
      id: "3",
      title: "Algorithms Lecture 3",
      date: "2025-10-13",
      time: "10:00 AM - 12:00 PM",
      room: "Huxley 340",
      module: "Algorithms",
    },
  ],
  databases: [
    {
      id: "4",
      title: "Databases Lecture 1",
      date: "2025-10-07",
      time: "9:00 AM - 11:00 AM",
      room: "Huxley 217",
      module: "Databases",
    },
    {
      id: "5",
      title: "Databases Lecture 2",
      date: "2025-10-10",
      time: "1:00 PM - 3:00 PM",
      room: "Huxley 217",
      module: "Databases",
    },
  ],
  networks: [
    {
      id: "6",
      title: "Computer Networks Lecture 1",
      date: "2025-10-09",
      time: "11:00 AM - 1:00 PM",
      room: "Huxley 308",
      module: "Computer Networks",
    },
  ],
  os: [
    {
      id: "7",
      title: "Operating Systems Lecture 1",
      date: "2025-10-06",
      time: "3:00 PM - 5:00 PM",
      room: "Huxley 311",
      module: "Operating Systems",
    },
  ],
  ai: [
    {
      id: "8",
      title: "Artificial Intelligence Lecture 1",
      date: "2025-10-11",
      time: "10:00 AM - 12:00 PM",
      room: "Huxley 341",
      module: "Artificial Intelligence",
    },
  ],
  graphics: [
    {
      id: "9",
      title: "Computer Graphics Lecture 1",
      date: "2025-10-12",
      time: "2:00 PM - 4:00 PM",
      room: "Huxley 344",
      module: "Computer Graphics",
    },
  ],
  security: [
    {
      id: "10",
      title: "Computer Security Lecture 1",
      date: "2025-10-14",
      time: "9:00 AM - 11:00 AM",
      room: "Huxley 413",
      module: "Computer Security",
    },
  ],
  "software-eng": [
    {
      id: "11",
      title: "Software Engineering Lecture 1",
      date: "2025-10-15",
      time: "1:00 PM - 3:00 PM",
      room: "Huxley 345",
      module: "Software Engineering",
    },
  ],
};

const Index = () => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [signedInUser, setSignedInUser] = useState<any>(null);

  // Aggregate lectures from all selected modules
  const lectures = selectedModules
    .flatMap((moduleId) => mockLectures[moduleId] || [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
          <div className="max-w-md mx-auto mb-8">
            <GoogleSignIn
              onSignInSuccess={handleSignInSuccess}
              onSignInError={handleSignInError}
            />
          </div>
        </header>

        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Select Modules
          </label>
          <ModuleSelector
            value={selectedModules}
            onChange={setSelectedModules}
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
              {!signedInUser && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
                  ⚠️ Please sign in with Google to add events to your calendar
                </p>
              )}
              <Button
                onClick={handleAddAllToCalendar}
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                disabled={!signedInUser}
              >
                <CalendarPlus className="mr-2 h-5 w-5" />
                Add to Calendar
              </Button>
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
