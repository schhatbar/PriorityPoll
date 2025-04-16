import { useState, useEffect, useRef } from "react";
import { Poll, PollOption, PollRanking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { GripVertical, Info, Check, MoveVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PriorityRankingProps {
  poll: Poll;
  onSubmit: (rankings: PollRanking[]) => void;
  isSubmitting: boolean;
}

export default function PriorityRanking({ poll, onSubmit, isSubmitting }: PriorityRankingProps) {
  const [rankedOptions, setRankedOptions] = useState<PollOption[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  
  useEffect(() => {
    // Initialize with poll options
    setRankedOptions([...poll.options]);
  }, [poll]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    // Skip if dragging over itself
    if (draggedIndex === index) return;
    
    // Create a new array with the element moved
    const newRankedOptions = [...rankedOptions];
    const draggedItem = newRankedOptions[draggedIndex];
    
    // Remove the dragged item
    newRankedOptions.splice(draggedIndex, 1);
    // Insert it at the new position
    newRankedOptions.splice(index, 0, draggedItem);
    
    // Update state and dragged index
    setRankedOptions(newRankedOptions);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    // Convert ranked options to rankings format (option id and rank)
    const rankings: PollRanking[] = rankedOptions.map((option, index) => ({
      optionId: option.id,
      rank: index + 1, // Rank 1 is highest priority
    }));
    
    onSubmit(rankings);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-700">
            Prioritize Options
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs sm:text-sm">
                <p>Drag items to rank them by priority. The first item is considered most important.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 py-1 px-2 rounded-md sm:bg-transparent sm:p-0">
          <MoveVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
          <span className="text-xs text-gray-500">Drag to reorder</span>
        </div>
      </div>
      
      <Card className="bg-gray-50/50 border-dashed mb-4 sm:mb-6">
        <CardContent className="p-2 sm:p-4">
          <ul ref={listRef} className="space-y-2">
            {rankedOptions.map((option, index) => (
              <li 
                key={option.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "bg-white border rounded-md p-2 sm:p-3 cursor-move flex items-center transition-all duration-200",
                  draggedIndex === index 
                    ? "border-primary shadow-md scale-[1.01]" 
                    : "border-gray-200 hover:border-gray-300",
                  index === 0 && "bg-primary/5 border-primary/40"
                )}
              >
                <div className="mr-2 sm:mr-3 flex-shrink-0 text-gray-400 p-1 rounded-md hover:bg-gray-100">
                  <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-grow min-w-0"> {/* min-width prevents overflow */}
                  <div className="font-medium text-gray-800 text-sm sm:text-base truncate">{option.text}</div>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {index === 0 ? (
                    <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 text-xs whitespace-nowrap">
                      <Check className="h-3 w-3 mr-1 hidden xs:inline" />
                      <span className="hidden xs:inline">Top Priority</span>
                      <span className="xs:hidden">Top</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className={cn(
                      "bg-gray-50 text-xs",
                      index < 3 && "border-primary/20 text-primary/80"
                    )}>
                      Rank {index + 1}
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="sm"
          className="relative overflow-hidden group text-sm h-9 sm:h-10 px-3 sm:px-4"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></span>
              Submitting...
            </span>
          ) : (
            <>
              <span className="relative z-10">Submit Ranking</span>
              <span className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
