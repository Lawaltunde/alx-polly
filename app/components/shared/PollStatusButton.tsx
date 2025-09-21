'use client';

import { togglePollStatus } from '@/app/lib/actions';
import { Button } from '@/components/ui/button';

export default function PollStatusButton({ pollId, status }: { pollId: string, status: 'open' | 'closed' | 'draft' }) {
  return (
    <form action={togglePollStatus.bind(null, pollId)}>
  <Button variant="outline" type="submit">
        {status === 'open' ? 'Close Poll' : 'Open Poll'}
      </Button>
    </form>
  );
}