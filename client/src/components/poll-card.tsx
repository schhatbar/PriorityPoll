import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChartBar, Edit, Trash } from "lucide-react";
import { Poll } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-800">{poll.title}</CardTitle>
          <Badge variant={poll.active ? "success" : "secondary"}>
            {poll.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mt-1 text-sm text-gray-600 mb-4">{poll.description}</p>
        <div className="flex items-center text-xs text-gray-500 mb-4">
          <span>Options: {poll.options.length}</span>
        </div>

        {isAdmin ? (
          <div className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              asChild
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
            >
              {poll.active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button
              variant="default"
              size="sm"
              asChild
            >
              <Link href={`/polls/${poll.id}`}>
                Participate
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
