export type TransactionStatus =
  | "sent"
  | "opened"
  | "completed"
  | "reminded"
  | "followed_up";

export interface Profile {
  id: string;
  company_name: string;
  google_review_url: string | null;
  phone: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string;
  weekly_report_enabled: boolean;
  is_blocked: boolean;
  sms_template: string | null;
  milestone_10_sent: boolean;
  milestone_25_sent: boolean;
  milestone_50_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  contractor_id: string;
  customer_name: string | null;
  customer_phone: string;
  token: string;
  status: TransactionStatus;
  created_at: string;
}

export interface Feedback {
  id: string;
  transaction_id: string;
  rating: number;
  comment: string | null;
  google_clicked: boolean;
  google_clicked_at: string | null;
  created_at: string;
}

export interface TransactionWithFeedback extends Transaction {
  feedback: Feedback | null;
}

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
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          company_name?: string;
          google_review_url?: string | null;
          phone?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string;
          weekly_report_enabled?: boolean;
          is_blocked?: boolean;
          sms_template?: string | null;
          milestone_10_sent?: boolean;
          milestone_25_sent?: boolean;
          milestone_50_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          company_name?: string;
          google_review_url?: string | null;
          phone?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_subscription_status?: string;
          weekly_report_enabled?: boolean;
          is_blocked?: boolean;
          sms_template?: string | null;
          milestone_10_sent?: boolean;
          milestone_25_sent?: boolean;
          milestone_50_sent?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: {
          id?: string;
          contractor_id: string;
          customer_name?: string | null;
          customer_phone: string;
          token?: string;
          status?: TransactionStatus;
          created_at?: string;
        };
        Update: {
          customer_name?: string | null;
          customer_phone?: string;
          status?: TransactionStatus;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_contractor_id_fkey";
            columns: ["contractor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: Feedback;
        Insert: {
          id?: string;
          transaction_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string | null;
          google_clicked?: boolean;
          google_clicked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: true;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      transaction_status: TransactionStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
