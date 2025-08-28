export type Poll = {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  createdAt: Date;
  createdBy: string;
  requireAuth: boolean;
  singleVote: boolean;
  voted: string[];
  status: "open" | "closed";
};