import { Poll } from "./definitions";
import fs from "fs";
import path from "path";

const pollsFilePath = path.join(process.cwd(), "app", "lib", "polls.json");

const readPolls = async (): Promise<Poll[]> => {
  try {
    const pollsData = await fs.promises.readFile(pollsFilePath, "utf-8");
    return JSON.parse(pollsData);
  } catch (error) {
    return [];
  }
};

export const writePolls = async (polls: Poll[]) => {
  await fs.promises.writeFile(pollsFilePath, JSON.stringify(polls, null, 2));
};

export const getPolls = async () => {
  return await readPolls();
};

export const getPoll = async (id: string) => {
  const polls = await readPolls();
  return polls.find((poll) => poll.id === id);
};

export const addPoll = async (poll: Poll) => {
  const polls = await readPolls();
  polls.push(poll);
  await writePolls(polls);
};

export const submitVote = async (pollId: string, optionText: string, userId?: string) => {
  const polls = await readPolls();
  const poll = polls.find((p) => p.id === pollId);

  if (!poll) {
    throw new Error("Poll not found");
  }

  const option = poll.options.find((o) => o.text === optionText);

  if (!option) {
    throw new Error("Option not found");
  }

  option.votes++;

  if (poll.singleVote && userId) {
    if (!poll.voted) {
      poll.voted = [];
    }
    poll.voted.push(userId);
  }

  await writePolls(polls);
};

export const removePoll = async (pollId: string) => {
  let polls = await readPolls();
  polls = polls.filter((p) => p.id !== pollId);
  await writePolls(polls);
};