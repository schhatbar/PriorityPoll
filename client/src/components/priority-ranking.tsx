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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium text-gray-700">
            Prioritize Options
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p>Drag items to rank them by priority. The first item is considered most important.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <MoveVertical className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">Drag to reorder</span>
        </div>
      </div>
      
      <Card className="bg-gray-50/50 border-dashed mb-6">
        <CardContent className="p-4">
          <ul ref={listRef} className="space-y-2">
            {rankedOptions.map((option, index) => (
              <li 
                key={option.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "bg-white border rounded-md p-3 cursor-move flex items-center transition-all duration-200",
                  draggedIndex === index 
                    ? "border-primary shadow-md scale-[1.01]" 
                    : "border-gray-200 hover:border-gray-300",
                  index === 0 && "bg-primary/5 border-primary/40"
                )}
              >
                <div className="mr-3 flex-shrink-0 text-gray-400 p-1 rounded-md hover:bg-gray-100">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <div className="font-medium text-gray-800">{option.text}</div>
                </div>
                <div className="flex-shrink-0">
                  {index === 0 ? (
                    <Badge className="bg-primary/20 text-primary border-primary/20 hover:bg-primary/30">
                      <Check className="h-3 w-3 mr-1" />
                      Top Priority
                    </Badge>
                  ) : (
                    <Badge variant="outline" className={cn(
                      "bg-gray-50",
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
          className="relative overflow-hidden group"
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-20 border-t-white rounded-full"></span>
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
