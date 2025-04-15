import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChartBar, Trash, Clock, ListChecks } from "lucide-react";
import { Poll } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import SharePoll from "./share-poll";
import { cn } from "@/lib/utils";

interface PollCardProps {
  poll: Poll;
  onDelete?: (id: number) => void;
}

export default function PollCard({ poll }: PollCardProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/polls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Poll deleted",
        description: "The poll has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete poll: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const res = await apiRequest("PATCH", `/api/polls/${id}/status`, { active });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: "Poll status updated",
        description: `The poll is now ${poll.active ? "inactive" : "active"}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update poll status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      deleteMutation.mutate(poll.id);
    }
  };

  const handleToggleStatus = () => {
    toggleStatusMutation.mutate({ id: poll.id, active: !poll.active });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader className={cn(
        "pb-2 border-b",
        poll.active ? "border-green-100" : "border-gray-100"
      )}>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold text-gray-800">{poll.title}</CardTitle>
          <Badge 
            variant={poll.active ? "default" : "secondary"}
            className={cn(
              "transition-colors",
              poll.active ? "bg-green-100 text-green-800 hover:bg-green-200" : ""
            )}
          >
            {poll.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-4 flex-grow">
        <p className="text-sm text-gray-600 mb-4">
          {poll.description}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <div className="flex items-center">
            <ListChecks className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>{poll.options.length} options</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
            <span>Created {new Date(poll.id * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 mt-auto">
        {isAdmin ? (
          <div className="flex flex-wrap gap-2 w-full justify-end">
            <SharePoll pollId={poll.id} pollTitle={poll.title} />
            <Button
              variant="outline"
              size="sm"
              asChild
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Link href={`/admin/results/${poll.id}`}>
                <ChartBar className="h-4 w-4 mr-1" />
                Results
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className={poll.active 
                ? "border-amber-200 text-amber-700 hover:bg-amber-50" 
                : "border-green-200 text-green-700 hover:bg-green-50"
              }
            >
              {poll.active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              className="bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 w-full justify-end">
            <SharePoll pollId={poll.id} pollTitle={poll.title} />
            {poll.active ? (
              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <Link href={`/polls/${poll.id}`}>
                  Participate
                </Link>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="cursor-not-allowed opacity-60"
              >
                Poll Closed
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
