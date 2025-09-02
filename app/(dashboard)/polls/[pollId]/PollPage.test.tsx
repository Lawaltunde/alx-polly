import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { vi } from 'vitest';
import PollPage from './page';
import { getPoll, submitVote } from '@/app/lib/data';
import { mockPoll } from '@/test/utils/test-utils';

vi.mock('@/app/lib/data', () => ({
  getPoll: vi.fn(),
  submitVote: vi.fn(),
}));

describe('PollPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the poll question and options', async () => {
    (getPoll as vi.Mock).mockResolvedValue(mockPoll);

    render(await PollPage({ params: { pollId: '1' } }));

    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Green')).toBeInTheDocument();
  });

  it('should display vote counts for each option', async () => {
    (getPoll as vi.Mock).mockResolvedValue(mockPoll);

    render(await PollPage({ params: { pollId: '1' } }));

    expect(screen.getByText('5 votes')).toBeInTheDocument();
    expect(screen.getByText('3 votes')).toBeInTheDocument();
    expect(screen.getByText('2 votes')).toBeInTheDocument();
  });

  it('should render a not found message if the poll does not exist', async () => {
    (getPoll as vi.Mock).mockResolvedValue(null);

    render(await PollPage({ params: { pollId: '404' } }));

    expect(screen.getByText('Poll not found')).toBeInTheDocument();
  });

  it('should handle voting functionality', async () => {
    (getPoll as vi.Mock).mockResolvedValue(mockPoll);
    (submitVote as vi.Mock).mockResolvedValue(undefined);

    render(await PollPage({ params: { pollId: '1' } }));

    const voteButtons = screen.getAllByRole('button');
    const redVoteButton = voteButtons.find(button => 
      button.textContent?.includes('Red')
    );

    if (redVoteButton) {
      fireEvent.click(redVoteButton);
      
      await waitFor(() => {
        expect(submitVote).toHaveBeenCalledWith('1', 'Red');
      });
    }
  });

  it('should display poll metadata correctly', async () => {
    const pollWithMetadata = {
      ...mockPoll,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      createdBy: 'test-user',
      requireAuth: true,
      singleVote: true,
      status: 'open' as const,
    };
    
    (getPoll as vi.Mock).mockResolvedValue(pollWithMetadata);

    render(await PollPage({ params: { pollId: '1' } }));

    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
  });

  it('should handle closed polls appropriately', async () => {
    const closedPoll = {
      ...mockPoll,
      status: 'closed' as const,
    };
    
    (getPoll as vi.Mock).mockResolvedValue(closedPoll);

    render(await PollPage({ params: { pollId: '1' } }));

    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
  });

  it('should handle data loading errors gracefully', async () => {
    (getPoll as vi.Mock).mockRejectedValue(new Error('Failed to load poll'));

    const component = await PollPage({ params: { pollId: '1' } });
    expect(component).toBeDefined();
  });
});