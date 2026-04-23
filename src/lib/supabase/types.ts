/**
 * Supabase DB 타입 정의.
 * 실제 운영 시에는 `supabase gen types typescript` 명령으로 자동 생성하는 걸 권장.
 * 여기서는 0001_init.sql 과 직접 매칭되는 수동 정의.
 */

export type BookingStatus = 'booked' | 'cancelled' | 'completed';
export type CreatedBy = 'student' | 'admin';

export interface StudentRow {
  id: string;
  name: string;
  birthdate_hash: string;
  parent_phone: string;
  profile_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRow {
  id: string;
  student_id: string;
  slot_date: string;       // 'YYYY-MM-DD'
  slot_start_time: string; // 'HH:MM:SS'
  status: BookingStatus;
  memo: string | null;
  created_by: CreatedBy;
  created_at: string;
  updated_at: string;
}

export interface FeedbackRow {
  id: string;
  student_id: string;
  booking_id: string | null;
  content: string;
  image_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface LoginAttemptRow {
  id: number;
  ip: string;
  name_input: string;
  success: boolean;
  attempted_at: string;
}

// Supabase 클라이언트 제네릭용
export interface Database {
  public: {
    Tables: {
      students: {
        Row: StudentRow;
        Insert: Omit<StudentRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<StudentRow, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: BookingRow;
        Insert: Omit<BookingRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<BookingRow, 'id' | 'created_at'>>;
      };
      feedbacks: {
        Row: FeedbackRow;
        Insert: Omit<FeedbackRow, 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Omit<FeedbackRow, 'id' | 'created_at'>>;
      };
      login_attempts: {
        Row: LoginAttemptRow;
        Insert: Omit<LoginAttemptRow, 'id' | 'attempted_at'> & { id?: number; attempted_at?: string };
        Update: Partial<LoginAttemptRow>;
      };
    };
    Enums: {
      booking_status: BookingStatus;
    };
  };
}
