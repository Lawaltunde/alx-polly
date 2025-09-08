
import PollResults from "@/app/components/shared/PollResults";

type PollResultsPageProps = {
  params: {
    pollId: string;
  };
};

export default async function PollResultsPage({ params }: PollResultsPageProps) {
  const { pollId } = params;

  return <PollResults pollId={pollId} />;
}