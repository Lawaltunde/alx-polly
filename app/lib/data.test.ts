import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPolls, getPoll, addPoll, submitVote, removePoll } from './data';
import fs from 'fs';
import path from 'path';

// Mock the modules
vi.mock('fs');
vi.mock('path');

const mockFs = vi.mocked(fs);
const mockPath = vi.mocked(path);

describe('Data Layer', () => {
  const mockPolls = [
    {
      id: '1',
      question: 'What is your favorite color?',
      options: [
        { id: '1', text: 'Red', votes: 5 },
        { id: '2', text: 'Blue', votes: 3 },
      ],
      createdAt: new Date('2024-01-01'),
      createdBy: 'user1',
      requireAuth: false,
      singleVote: true,
      status: 'open' as const,
      voted: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockPath.join.mockReturnValue('/mock/path/polls.json');
  });

  describe('getPolls', () => {
    it('should return polls from file', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));

      const result = await getPolls();

      expect(result).toEqual(mockPolls);
      expect(mockFs.promises.readFile).toHaveBeenCalledWith('/mock/path/polls.json', 'utf-8');
    });

    it('should return empty array when file does not exist', async () => {
      mockFs.promises.readFile.mockRejectedValue(new Error('File not found'));

      const result = await getPolls();

      expect(result).toEqual([]);
    });
  });

  describe('getPoll', () => {
    it('should return a specific poll by id', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));

      const result = await getPoll('1');

      expect(result).toEqual(mockPolls[0]);
    });

    it('should return undefined when poll does not exist', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));

      const result = await getPoll('999');

      expect(result).toBeUndefined();
    });
  });

  describe('addPoll', () => {
    it('should add a new poll to the file', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      const newPoll = {
        id: '2',
        question: 'What is your favorite food?',
        options: [
          { id: '1', text: 'Pizza', votes: 0 },
          { id: '2', text: 'Burger', votes: 0 },
        ],
        createdAt: new Date('2024-01-02'),
        createdBy: 'user2',
        requireAuth: false,
        singleVote: true,
        status: 'open' as const,
        voted: [],
      };

      await addPoll(newPoll);

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/mock/path/polls.json',
        JSON.stringify([...mockPolls, newPoll], null, 2)
      );
    });
  });

  describe('submitVote', () => {
    it('should increment vote count for an option', async () => {
      const pollsWithVotes = [
        {
          ...mockPolls[0],
          options: [
            { id: '1', text: 'Red', votes: 5 },
            { id: '2', text: 'Blue', votes: 3 },
          ],
        },
      ];

      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(pollsWithVotes));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      await submitVote('1', 'Red');

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/mock/path/polls.json',
        expect.stringContaining('"votes": 6')
      );
    });

    it('should throw error when poll not found', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));

      await expect(submitVote('999', 'Red')).rejects.toThrow('Poll not found');
    });

    it('should throw error when option not found', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));

      await expect(submitVote('1', 'Yellow')).rejects.toThrow('Option not found');
    });

    it('should track user votes for single vote polls', async () => {
      const pollsWithSingleVote = [
        {
          ...mockPolls[0],
          singleVote: true,
          voted: [],
        },
      ];

      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(pollsWithSingleVote));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      await submitVote('1', 'Red', 'user123');

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/mock/path/polls.json',
        expect.stringContaining('"voted": ["user123"]')
      );
    });
  });

  describe('removePoll', () => {
    it('should remove a poll by id', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      await removePoll('1');

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/mock/path/polls.json',
        JSON.stringify([], null, 2)
      );
    });

    it('should handle removing non-existent poll', async () => {
      mockFs.promises.readFile.mockResolvedValue(JSON.stringify(mockPolls));
      mockFs.promises.writeFile.mockResolvedValue(undefined);

      await removePoll('999');

      expect(mockFs.promises.writeFile).toHaveBeenCalledWith(
        '/mock/path/polls.json',
        JSON.stringify(mockPolls, null, 2)
      );
    });
  });
});
