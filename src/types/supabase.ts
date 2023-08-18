export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      Exercises: {
        Row: {
          baseCode: string;
          id: string;
          instructions: string;
          language: string;
          level: number;
          maxPoints: number;
          minPoints: number;
          name: string;
          tests: string;
          trackId: string;
        };
        Insert: {
          baseCode: string;
          id?: string;
          instructions: string;
          language: string;
          level: number;
          maxPoints: number;
          minPoints: number;
          name: string;
          tests: string;
          trackId: string;
        };
        Update: {
          baseCode?: string;
          id?: string;
          instructions?: string;
          language?: string;
          level?: number;
          maxPoints?: number;
          minPoints?: number;
          name?: string;
          tests?: string;
          trackId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'Exercises_trackId_fkey';
            columns: ['trackId'];
            referencedRelation: 'Tracks';
            referencedColumns: ['id'];
          },
        ];
      };
      Tracks: {
        Row: {
          id: string;
          name: string;
          tags: string[];
        };
        Insert: {
          id?: string;
          name: string;
          tags: string[];
        };
        Update: {
          id?: string;
          name?: string;
          tags?: string[];
        };
        Relationships: [];
      };
      UserExercises: {
        Row: {
          exerciseId: string;
          isCompleted: boolean;
          pointsEarned: number;
          trackId: string;
          uid: string;
          usersCode: string;
        };
        Insert: {
          exerciseId: string;
          isCompleted?: boolean;
          pointsEarned?: number;
          trackId: string;
          uid: string;
          usersCode: string;
        };
        Update: {
          exerciseId?: string;
          isCompleted?: boolean;
          pointsEarned?: number;
          trackId?: string;
          uid?: string;
          usersCode?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserExercises_exerciseId_fkey';
            columns: ['exerciseId'];
            referencedRelation: 'Exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserExercises_trackId_fkey';
            columns: ['trackId'];
            referencedRelation: 'Tracks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserExercises_uid_fkey';
            columns: ['uid'];
            referencedRelation: 'Users';
            referencedColumns: ['uid'];
          },
        ];
      };
      UserRanks: {
        Row: {
          globalRank: number;
          uid: string;
          weeklyRank: number;
        };
        Insert: {
          globalRank: number;
          uid: string;
          weeklyRank: number;
        };
        Update: {
          globalRank?: number;
          uid?: string;
          weeklyRank?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'UserRanks_uid_fkey';
            columns: ['uid'];
            referencedRelation: 'Users';
            referencedColumns: ['uid'];
          },
        ];
      };
      Users: {
        Row: {
          createdAt: string;
          id: number;
          longestStreak: number;
          streak: number;
          totalPoints: number;
          uid: string;
        };
        Insert: {
          createdAt?: string;
          id?: number;
          longestStreak?: number;
          streak?: number;
          totalPoints?: number;
          uid: string;
        };
        Update: {
          createdAt?: string;
          id?: number;
          longestStreak?: number;
          streak?: number;
          totalPoints?: number;
          uid?: string;
        };
        Relationships: [];
      };
      UsersActivity: {
        Row: {
          created_at: string;
          exerciseId: string;
          id: number;
          uid: string;
        };
        Insert: {
          created_at?: string;
          exerciseId: string;
          id?: number;
          uid: string;
        };
        Update: {
          created_at?: string;
          exerciseId?: string;
          id?: number;
          uid?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UsersActivity_exerciseId_fkey';
            columns: ['exerciseId'];
            referencedRelation: 'Exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UsersActivity_uid_fkey';
            columns: ['uid'];
            referencedRelation: 'Users';
            referencedColumns: ['uid'];
          },
        ];
      };
      UserTracks: {
        Row: {
          id: number;
          trackId: string;
          uid: string;
        };
        Insert: {
          id?: number;
          trackId: string;
          uid: string;
        };
        Update: {
          id?: number;
          trackId?: string;
          uid?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserTracks_trackId_fkey';
            columns: ['trackId'];
            referencedRelation: 'Tracks';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserTracks_uid_fkey';
            columns: ['uid'];
            referencedRelation: 'Users';
            referencedColumns: ['uid'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
