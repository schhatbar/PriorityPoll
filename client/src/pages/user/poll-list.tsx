import { useQuery } from "@tanstack/react-query";
import { Poll } from "@shared/schema";
import Layout from "@/components/layout/layout";
import PollCard from "@/components/poll-card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function PollList() {
  const { user } = useAuth();
  
  const { data: polls, isLoading, error } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold text-red-600">Error loading polls</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
        </div>
      </Layout>
    );
  }

  const activePolls = polls?.filter(poll => poll.active) || [];

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Available Polls</h2>
        <p className="mt-1 text-sm text-gray-600">
          Participate in priority polls by ranking options in your preferred order.
        </p>
      </div>
      
      {activePolls.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">No active polls available</h3>
          <p className="mt-2 text-gray-600">Check back later for new polls to participate in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePolls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </Layout>
  );
}
