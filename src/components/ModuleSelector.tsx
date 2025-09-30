import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModuleSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const modules = [
  { id: "algorithms", name: "Algorithms" },
  { id: "databases", name: "Databases" },
  { id: "networks", name: "Computer Networks" },
  { id: "os", name: "Operating Systems" },
  { id: "ai", name: "Artificial Intelligence" },
  { id: "graphics", name: "Computer Graphics" },
  { id: "security", name: "Computer Security" },
  { id: "software-eng", name: "Software Engineering" },
];

export const ModuleSelector = ({ value, onChange }: ModuleSelectorProps) => {
  const toggleModule = (moduleId: string) => {
    if (value.includes(moduleId)) {
      onChange(value.filter((id) => id !== moduleId));
    } else {
      onChange([...value, moduleId]);
    }
  };

  const removeModule = (moduleId: string) => {
    onChange(value.filter((id) => id !== moduleId));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedModules = modules.filter((m) => value.includes(m.id));

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-card border-border hover:border-primary transition-colors h-auto min-h-[2.5rem] py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1 mr-2">
              {selectedModules.length === 0 ? (
                <span className="text-muted-foreground">Select modules</span>
              ) : (
                selectedModules.map((module) => (
                  <Badge
                    key={module.id}
                    variant="secondary"
                    className="bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    {module.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeModule(module.id);
                      }}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-popover border-border z-50">
          <div className="p-2">
            {value.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full mb-2 text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <div className="space-y-1">
              {modules.map((module) => (
                <label
                  key={module.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={value.includes(module.id)}
                    onCheckedChange={() => toggleModule(module.id)}
                  />
                  <span className="text-sm flex-1">{module.name}</span>
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {selectedModules.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedModules.length} module{selectedModules.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
