import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, Link } from "wouter";
import { Poll, PollRanking } from "@shared/schema";
import Layout from "@/components/layout/layout";
import PriorityRanking from "@/components/priority-ranking";
import SharePoll from "@/components/share-poll";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, CheckCircle2, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const voterSchema = z.object({
  voterName: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long")
});

type VoterFormValues = z.infer<typeof voterSchema>;

export default function ParticipatePoll() {
  const { id } = useParams<{ id: string }>();
  const pollId = parseInt(id);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const [voterName, setVoterName] = useState<string | null>(null);
  
  const form = useForm<VoterFormValues>({
    resolver: zodResolver(voterSchema),
    defaultValues: {
      voterName: "",
    },
  });

  const { data: poll, isLoading: isPollLoading, error: pollError } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
  });

  const { data: voteStatus, isLoading: isVoteStatusLoading } = useQuery<{ hasVoted: boolean }>({
    queryKey: [`/api/polls/${pollId}/has-voted`],
    queryFn: async () => {
      if (!voterName) return { hasVoted: false };
      return apiRequest("GET", `/api/polls/${pollId}/has-voted?voterName=${encodeURIComponent(voterName)}`)
        .then(res => res.json());
    },
    enabled: !!pollId && !isNaN(pollId) && !!voterName,
  });

  const submitVoteMutation = useMutation({
    mutationFn: async (data: { rankings: PollRanking[], voterName: string }) => {
      await apiRequest("POST", "/api/votes", {
        pollId,
        rankings: data.rankings,
        voterName: data.voterName
      });
    },
    onSuccess: () => {
      // Show success toast with gamification message
      toast({
        title: "Vote submitted! +10 points",
        description: "Your ranking has been recorded successfully. You earned points for voting!",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/polls/${pollId}/has-voted`] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-points", voterName] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-votes", voterName] });
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
    if (!voterName) return;
    submitVoteMutation.mutate({ rankings, voterName });
  };

  const onSubmitName = (values: VoterFormValues) => {
    setVoterName(values.voterName);
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (isPollLoading) {
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

  if (!voterName) {
    return (
      <Layout>
        <div className="mb-6 flex items-center">
          <Button variant="ghost" onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Participate in Poll</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{poll.title}</CardTitle>
            <p className="mt-1 text-sm text-gray-600">{poll.description}</p>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-medium mb-4">Enter your name to participate</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitName)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="voterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Continue</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
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
              
              {submitVoteMutation.isSuccess && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg max-w-md mx-auto">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium text-green-800">+10 points earned!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    You've earned points for voting. Check the <a href="/leaderboard" className="underline font-medium">leaderboard</a> to see your ranking!
                  </p>
                </div>
              )}
              
              <div className="flex flex-col items-center gap-3 mt-6">
                <p className="text-sm text-gray-500">Share this poll with others:</p>
                <SharePoll pollId={pollId} pollTitle={poll.title} />
                <div className="flex gap-2 mt-2">
                  <Button onClick={handleBack}>
                    Return to polls
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/leaderboard">
                      <Trophy className="h-4 w-4 mr-1" />
                      Leaderboard
                    </Link>
                  </Button>
                </div>
              </div>
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
