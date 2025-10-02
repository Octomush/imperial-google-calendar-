import { ModuleSelector } from "@/components/ModuleSelector";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadICSFile, generateICSContent } from "@/utils/calendarUtils";
import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import computingTimetable from "../computing.json";
import computingModules from "../computingModules.json";
import mathsTimetable from "../mathematics.json";
import mathsModules from "../mathsModules.json";

const Index = () => {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("computing");

  const handleDownloadICS = () => {
    if (selectedModules.length === 0) {
      toast.error("No lectures to download");
      return;
    }

    try {
      const timetable =
        selectedCourse === "computing" ? computingTimetable : mathsTimetable;
      const icsContent = generateICSContent(timetable, selectedModules);
      downloadICSFile(icsContent, `imperial-${selectedCourse}-timetable.ics`);
      toast.success(
        `Downloaded calendar for ${selectedModules.length} lecture${
          selectedModules.length !== 1 ? "s" : ""
        }`
      );
    } catch (error) {
      console.error("Error downloading ICS file:", error);
      toast.error("Failed to download calendar file");
    }
  };

  const handleDownloadButton = () => {
    handleDownloadICS();
    window.open(
      "https://calendar.google.com/calendar/u/0/r/settings/export",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-4">
          <h1
            className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            style={{ fontSize: "3rem", lineHeight: 1.5 }}
          >
            Imperial College Timetable
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Download and keep your lecture timetable
          </p>
        </header>

        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Department
          </label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="bg-white text-muted-foreground font-medium px-4">
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="computing">Computing</SelectItem>
              <SelectItem value="mathematics">Mathematics</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-8 max-w-md mx-auto">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Modules
          </label>
          <ModuleSelector
            value={selectedModules}
            onChange={setSelectedModules}
            availableModules={
              selectedCourse === "computing" ? computingModules : mathsModules
            }
          />
        </div>

        {selectedModules.length > 0 && (
          <div className="text-center space-y-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md mx-auto">
              <p className="text-lg font-medium text-foreground mb-2">
                Ready to add {selectedModules.length} lecture
                {selectedModules.length !== 1 ? "s" : ""}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                From {selectedModules.length} selected module
                {selectedModules.length !== 1 ? "s" : ""}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={handleDownloadButton}
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
