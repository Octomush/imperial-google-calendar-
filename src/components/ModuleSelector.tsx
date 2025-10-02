import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, X } from "lucide-react";

interface ModuleSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  availableModules: string[];
}

export const ModuleSelector = ({
  value,
  onChange,
  availableModules,
}: ModuleSelectorProps) => {
  const toggleModule = (moduleId: string) => {
    onChange(
      value.includes(moduleId)
        ? value.filter((id) => id !== moduleId)
        : [...value, moduleId]
    );
  };

  const removeModule = (moduleId: string) => {
    onChange(value.filter((id) => id !== moduleId));
  };

  const clearAll = () => onChange([]);

  const selectedModules = availableModules.filter((m) => value.includes(m));

  const renderSelectedBadges = () => {
    if (selectedModules.length === 0) {
      return <span className="text-muted-foreground">Select modules</span>;
    }

    return selectedModules.map((module) => (
      <Badge
        key={module}
        variant="secondary"
        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs truncate max-w-[150px] sm:max-w-none"
      >
        <span className="truncate">{module}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeModule(module);
          }}
          className="ml-1 hover:text-destructive flex-shrink-0"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ));
  };

  const renderModuleOptions = () => (
    <div className="max-h-60 overflow-y-auto space-y-1">
      {availableModules.map((module) => (
        <label
          key={module}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
        >
          <Checkbox
            checked={value.includes(module)}
            onCheckedChange={() => toggleModule(module)}
          />
          <span className="text-sm flex-1">{module}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-card border-border hover:border-primary transition-colors h-auto min-h-[2.5rem] py-2"
          >
            <div className="flex flex-wrap gap-1 flex-1 mr-2 min-w-0">
              {renderSelectedBadges()}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
            {renderModuleOptions()}
          </div>
        </PopoverContent>
      </Popover>

      {selectedModules.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2">
          {selectedModules.length} module
          {selectedModules.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
};
