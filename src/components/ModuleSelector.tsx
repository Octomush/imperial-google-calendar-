import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="w-full relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-card border border-border hover:border-primary transition-colors h-auto min-h-[2.5rem] py-2 px-3 rounded-md"
      >
        <div className="flex flex-wrap gap-1 flex-1 mr-2">
          {selectedModules.length === 0 ? (
            <span className="text-muted-foreground">Select modules</span>
          ) : (
            selectedModules.map((module) => (
              <span
                key={module.id}
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary"
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
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute w-full mt-1 p-2 bg-popover border border-border rounded-md shadow-md z-50">
            {value.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full mb-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              >
                Clear all
              </button>
            )}
            <div className="space-y-1">
              {modules.map((module) => (
                <label
                  key={module.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(module.id)}
                    onChange={() => toggleModule(module.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm flex-1">{module.name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedModules.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedModules.length} module
          {selectedModules.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
