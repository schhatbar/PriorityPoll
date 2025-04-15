import { useState, useEffect, useRef } from "react";
import { Poll, PollOption, PollRanking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Drag to reorder options by priority (most important first)
      </h3>
      
      <ul ref={listRef} className="mt-3 space-y-3">
        {rankedOptions.map((option, index) => (
          <li 
            key={option.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-gray-50 border ${
              draggedIndex === index ? 'border-primary' : 'border-gray-200'
            } rounded-md p-4 cursor-move flex items-center`}
          >
            <div className="mr-3 flex-shrink-0 text-gray-400">
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-grow">
              <div className="font-medium text-gray-800">{option.text}</div>
            </div>
            <div className="flex-shrink-0">
              <Badge variant="outline" className="bg-gray-100">
                Rank {index + 1}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="mt-6 flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-white"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Ranking'}
        </Button>
      </div>
    </div>
  );
}
