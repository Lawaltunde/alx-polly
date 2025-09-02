import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import PollsPage from './page';
import { getPolls } from '@/app/lib/data';
import { mockPolls } from '@/test/utils/test-utils';

vi.mock('@/app/lib/data', () => ({
  getPolls: vi.fn(),
}));

describe('PollsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render polls list when polls exist', async () => {
    (getPolls as vi.Mock).mockResolvedValue(mockPolls);

    render(await PollsPage());

    expect(screen.getByText('Polls')).toBeInTheDocument();
    expect(screen.getByText('What is your favorite color?')).toBeInTheDocument();
    expect(screen.getByText('What is your favorite programming language?')).toBeInTheDocument();
    expect(screen.getByText('Create Poll')).toBeInTheDocument();
  });

  it('should render empty state when no polls exist', async () => {
    (getPolls as vi.Mock).mockResolvedValue([]);

    render(await PollsPage());

    expect(screen.getByText('No Polls Yet')).toBeInTheDocument();
    expect(screen.getByText(/It looks like there are no polls available right now/)).toBeInTheDocument();
    expect(screen.getByText('Create a New Poll')).toBeInTheDocument();
  });

  it('should display poll options correctly', async () => {
    (getPolls as vi.Mock).mockResolvedValue(mockPolls);

    render(await PollsPage());

    expect(screen.getByText('Red, Blue, Green')).toBeInTheDocument();
    expect(screen.getByText('JavaScript, TypeScript, Python')).toBeInTheDocument();
  });

  it('should display total vote count for each poll', async () => {
    (getPolls as vi.Mock).mockResolvedValue(mockPolls);

    render(await PollsPage());

    // First poll has 10 total votes (5+3+2)
    expect(screen.getByText('10 votes')).toBeInTheDocument();
    // Second poll has 24 total votes (10+8+6)
    expect(screen.getByText('24 votes')).toBeInTheDocument();
  });

  it('should have correct links to poll details', async () => {
    (getPolls as vi.Mock).mockResolvedValue(mockPolls);

    render(await PollsPage());

    const pollLinks = screen.getAllByRole('link');
    expect(pollLinks[1]).toHaveAttribute('href', '/polls/1');
    expect(pollLinks[2]).toHaveAttribute('href', '/polls/2');
  });

  it('should have correct link to create new poll', async () => {
    (getPolls as vi.Mock).mockResolvedValue(mockPolls);

    render(await PollsPage());

    const createPollLink = screen.getByText('Create Poll').closest('a');
    expect(createPollLink).toHaveAttribute('href', '/polls/new');
  });

  it('should handle data loading error gracefully', async () => {
    (getPolls as vi.Mock).mockRejectedValue(new Error('Failed to load polls'));

    // This should not throw and should render the component
    const component = await PollsPage();
    expect(component).toBeDefined();
  });
});
