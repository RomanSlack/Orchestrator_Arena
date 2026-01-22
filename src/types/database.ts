export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CompetitionStatus = "upcoming" | "live" | "voting" | "completed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          github_username: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          github_username: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          github_username?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      competitions: {
        Row: {
          id: string;
          title: string;
          description: string;
          prompt: string;
          status: CompetitionStatus;
          starts_at: string;
          ends_at: string;
          voting_ends_at: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          prompt: string;
          status?: CompetitionStatus;
          starts_at: string;
          ends_at: string;
          voting_ends_at: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          prompt?: string;
          status?: CompetitionStatus;
          starts_at?: string;
          ends_at?: string;
          voting_ends_at?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      participants: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          competition_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          competition_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          competition_id: string;
          user_id: string;
          title: string;
          description: string | null;
          repo_url: string;
          demo_url: string | null;
          repo_created_at: string | null;
          submitted_at: string;
          yes_votes: number;
          no_votes: number;
        };
        Insert: {
          id?: string;
          competition_id: string;
          user_id: string;
          title: string;
          description?: string | null;
          repo_url: string;
          demo_url?: string | null;
          repo_created_at?: string | null;
          submitted_at?: string;
          yes_votes?: number;
          no_votes?: number;
        };
        Update: {
          id?: string;
          competition_id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          repo_url?: string;
          demo_url?: string | null;
          repo_created_at?: string | null;
          submitted_at?: string;
          yes_votes?: number;
          no_votes?: number;
        };
      };
      votes: {
        Row: {
          id: string;
          submission_id: string;
          user_id: string;
          vote: boolean;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          user_id: string;
          vote: boolean;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submission_id?: string;
          user_id?: string;
          vote?: boolean;
          comment?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_effective_status: {
        Args: {
          starts_at: string;
          ends_at: string;
          voting_ends_at: string;
        };
        Returns: CompetitionStatus;
      };
    };
    Enums: {
      competition_status: CompetitionStatus;
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Competition = Database["public"]["Tables"]["competitions"]["Row"];
export type Participant = Database["public"]["Tables"]["participants"]["Row"];
export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];

// Extended types with joins
export type SubmissionWithProfile = Submission & {
  profiles: Profile;
};

export type CompetitionWithParticipantCount = Competition & {
  participant_count: number;
};
