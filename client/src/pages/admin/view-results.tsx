import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Poll, Vote, PollOption, PollRanking } from "@shared/schema";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Clock, User, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ViewResults() {
  const { id } = useParams<{ id: string }>();
  const pollId = parseInt(id);
  const [_, setLocation] = useLocation();

  const { data: poll, isLoading: isPollLoading, error: pollError } = useQuery<Poll>({
    queryKey: [`/api/polls/${pollId}`],
  });

  const { data: votes, isLoading: isVotesLoading, error: votesError } = useQuery<Vote[]>({
    queryKey: [`/api/polls/${pollId}/votes`],
    enabled: !!poll,
  });

  const isLoading = isPollLoading || isVotesLoading;
  const error = pollError || votesError;

  const handleBack = () => {
    setLocation("/admin");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !poll) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">
            {error ? `Error: ${error?.message}` : "Poll not found"}
          </h2>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </Layout>
    );
  }

  // Format data for the chart
  const chartData = poll.results ? Object.entries(poll.results).map(([option, points]) => ({
    name: option,
    points: points,
  })) : [];

  // Sort data by points (descending)
  if (chartData.length > 0) {
    chartData.sort((a, b) => b.points - a.points);
  }
  
  // Get poll options
  const pollOptions = poll.options as PollOption[];

  // Helper function to get option text by ID
  const getOptionTextById = (optionId: number) => {
    const option = pollOptions.find(opt => opt.id === optionId);
    return option ? option.text : 'Unknown option';
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center">
        <Button variant="ghost" onClick={handleBack} className="mr-3">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-semibold text-gray-800">Poll Results</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{poll.title}</CardTitle>
          <CardDescription>{poll.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="individual">Individual Votes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Ranking Results</h3>
              
              {chartData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">No votes have been recorded for this poll yet.</p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={150}
                          tickFormatter={(value) => 
                            value.length > 20 ? value.substring(0, 20) + '...' : value
                          }
                        />
                        <Tooltip />
                        <Bar dataKey="points" fill="#3B82F6" barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-48 mr-4 text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </div>
                        <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ 
                              width: `${Math.max(5, (item.points / Math.max(...chartData.map(d => d.points))) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="ml-3 text-sm font-medium text-gray-700">{item.points} points</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1 text-gray-400" />
                      Last updated: {new Date().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="individual">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Individual Voter Rankings</h3>
              
              {!votes || votes.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600">No votes have been recorded for this poll yet.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-6">
                  {votes.map((vote) => {
                    const rankings = vote.rankings as PollRanking[];
                    // Sort by rank (ascending)
                    const sortedRankings = [...rankings].sort((a, b) => a.rank - b.rank);
                    
                    return (
                      <Card key={vote.id} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 py-3">
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-2 text-gray-500" />
                            <CardTitle className="text-base">{vote.voterName}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="py-4">
                          <div className="space-y-2">
                            {sortedRankings.map((ranking, idx) => (
                              <div key={idx} className="flex items-center py-1">
                                <Badge variant={ranking.rank === 1 ? "default" : "outline"} className="mr-3 w-8 text-center">
                                  {ranking.rank === 1 ? (
                                    <div className="flex items-center justify-center">
                                      <Award className="h-3 w-3 mr-1" /> 1
                                    </div>
                                  ) : (
                                    ranking.rank
                                  )}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {getOptionTextById(ranking.optionId)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}
