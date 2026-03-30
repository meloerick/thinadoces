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
      store_settings: {
        Row: {
          id: string;
          orders_enabled: boolean;
          store_open: boolean;
          warning_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          orders_enabled?: boolean;
          store_open?: boolean;
          warning_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          orders_enabled?: boolean;
          store_open?: boolean;
          warning_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          category: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          category?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          category?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string;
          note: string | null;
          payment_method: string;
          status: string;
          total_price: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_phone: string;
          customer_address: string;
          note?: string | null;
          payment_method: string;
          status?: string;
          total_price: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_address?: string;
          note?: string | null;
          payment_method?: string;
          status?: string;
          total_price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          unit_price: number;
          quantity: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          subtotal?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
}
