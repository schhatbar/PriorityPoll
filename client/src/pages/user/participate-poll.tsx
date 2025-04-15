import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Poll, PollRanking } from "@shared/schema";
import Layout from "@/components/layout/layout";
import PriorityRanking from "@/components/priority-ranking";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function ParticipatePoll() {
  const { id } = useParams<{ id: string }>();
  const pollId = parseInt(id);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: poll, isLoading: isPollLoading, error: pollError } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
  });

  const { data: voteStatus, isLoading: isVoteStatusLoading } = useQuery<{ hasVoted: boolean }>({
    queryKey: [`/api/polls/${pollId}/has-voted`],
    enabled: !!pollId && !isNaN(pollId),
  });

  const submitVoteMutation = useMutation({
    mutationFn: async (rankings: PollRanking[]) => {
      await apiRequest("POST", "/api/votes", {
        pollId,
        rankings,
      });
    },
    onSuccess: () => {
      toast({
        title: "Vote submitted!",
        description: "Your ranking has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/polls/${pollId}/has-voted`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to submit your vote: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (rankings: PollRanking[]) => {
    submitVoteMutation.mutate(rankings);
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (isPollLoading || isVoteStatusLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (pollError) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">Error loading poll</h2>
          <p className="mt-2 text-gray-600">{pollError.message}</p>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">Poll not found</h2>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  if (voteStatus?.hasVoted || submitVoteMutation.isSuccess) {
    return (
      <Layout>
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Thank You</h2>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Your vote has been recorded</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Thank you for participating in this poll. Your priorities have been registered.
              </p>
              <Button className="mt-6" onClick={handleBack}>
                Return to polls
              </Button>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Rank Options</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          <p className="mt-1 text-sm text-gray-600">{poll.description}</p>
        </CardHeader>
        <CardContent>
          <PriorityRanking 
            poll={poll} 
            onSubmit={handleSubmit} 
            isSubmitting={submitVoteMutation.isPending} 
          />
        </CardContent>
      </Card>
    </Layout>
  );
}
