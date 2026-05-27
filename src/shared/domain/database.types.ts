export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: number
          code: string
          name: string
          role: string
          department: string
          email: string
          phone: string | null
          password_hash: string | null
          auth_id: string | null
          status: string
          target: number | null
          actual: number | null
          revenue: number | null
          target_revenue: number | null
          target_profit: number | null
          actual_profit: number | null
          base_salary: number | null
          commission_per_car: number | null
          created_at: string
          updated_at: string
          expenses: Json
          paid_months: string[] | null
        }
        Insert: {
          id?: number
          code: string
          name: string
          role: string
          department: string
          email: string
          phone?: string | null
          password_hash?: string | null
          auth_id?: string | null
          status?: string
          target?: number | null
          actual?: number | null
          revenue?: number | null
          target_revenue?: number | null
          target_profit?: number | null
          actual_profit?: number | null
          base_salary?: number | null
          commission_per_car?: number | null
          created_at?: string
          updated_at?: string
          expenses?: Json
          paid_months?: string[] | null
        }
        Update: {
          id?: number
          code?: string
          name?: string
          role?: string
          department?: string
          email?: string
          phone?: string | null
          password_hash?: string | null
          auth_id?: string | null
          status?: string
          target?: number | null
          actual?: number | null
          revenue?: number | null
          target_revenue?: number | null
          target_profit?: number | null
          actual_profit?: number | null
          base_salary?: number | null
          commission_per_car?: number | null
          created_at?: string
          updated_at?: string
          expenses?: Json
          paid_months?: string[] | null
        }
      }
      vehicles: {
        Row: {
          id: number
          code: string
          name: string
          year: number
          odo: number | null
          purchase_price: number
          sale_price: number | null
          total_cost: number | null
          received_amount: number | null
          receivable_payable: number | null
          profit: number | null
          status: string
          days: number | null
          color: string | null
          purchase_date: string | null
          sale_date: string | null
          buyer: string | null
          seller: string | null
          commission: number | null
          buying_commission: number | null
          payment_history: Json
          cost_history: Json
          history: Json
          created_at: string
          updated_at: string
          image_url: string | null
          is_coinvested: boolean | null
          coinvestor_code: string | null
          coinvest_amount: number | null
          purchase_paid_amount: number | null
          purchase_payment_history: Json
          is_pinned: boolean | null
          notes: string | null
          sale_payment_history: Json
          buyer_name: string | null
          seller_name: string | null
          partner_capital_repaid: boolean | null
          partner_profit_shared: boolean | null
          buying_bonus: number | null
          buying_bonus_paid: boolean | null
          battery_type: string | null
          show_on_landing: boolean | null
        }
        Insert: {
          id?: number
          code: string
          name: string
          year: number
          odo?: number | null
          purchase_price: number
          sale_price?: number | null
          total_cost?: number | null
          received_amount?: number | null
          receivable_payable?: number | null
          profit?: number | null
          status?: string
          days?: number | null
          color?: string | null
          purchase_date?: string | null
          sale_date?: string | null
          buyer?: string | null
          seller?: string | null
          commission?: number | null
          buying_commission?: number | null
          payment_history?: Json
          cost_history?: Json
          history?: Json
          created_at?: string
          updated_at?: string
          image_url?: string | null
          is_coinvested?: boolean | null
          coinvestor_code?: string | null
          coinvest_amount?: number | null
          purchase_paid_amount?: number | null
          purchase_payment_history?: Json
          is_pinned?: boolean | null
          notes?: string | null
          sale_payment_history?: Json
          buyer_name?: string | null
          seller_name?: string | null
          partner_capital_repaid?: boolean | null
          partner_profit_shared?: boolean | null
          buying_bonus?: number | null
          buying_bonus_paid?: boolean | null
          battery_type?: string | null
          show_on_landing?: boolean | null
        }
        Update: {
          id?: number
          code?: string
          name?: string
          year?: number
          odo?: number | null
          purchase_price?: number
          sale_price?: number | null
          total_cost?: number | null
          received_amount?: number | null
          receivable_payable?: number | null
          profit?: number | null
          status?: string
          days?: number | null
          color?: string | null
          purchase_date?: string | null
          sale_date?: string | null
          buyer?: string | null
          seller?: string | null
          commission?: number | null
          buying_commission?: number | null
          payment_history?: Json
          cost_history?: Json
          history?: Json
          created_at?: string
          updated_at?: string
          image_url?: string | null
          is_coinvested?: boolean | null
          coinvestor_code?: string | null
          coinvest_amount?: number | null
          purchase_paid_amount?: number | null
          purchase_payment_history?: Json
          is_pinned?: boolean | null
          notes?: string | null
          sale_payment_history?: Json
          buyer_name?: string | null
          seller_name?: string | null
          partner_capital_repaid?: boolean | null
          partner_profit_shared?: boolean | null
          buying_bonus?: number | null
          buying_bonus_paid?: boolean | null
          battery_type?: string | null
          show_on_landing?: boolean | null
        }
      }
      operating_expenses: {
        Row: {
          id: number
          name: string
          amount: number
          date: string
          category: string
          created_at: string | null
        }
        Insert: {
          id?: number
          name: string
          amount: number
          date: string
          category: string
          created_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          amount?: number
          date?: string
          category?: string
          created_at?: string | null
        }
      }
      company_settings: {
        Row: {
          id: number
          total_capital: number
          updated_at: string | null
        }
        Insert: {
          id?: number
          total_capital?: number
          updated_at?: string | null
        }
        Update: {
          id?: number
          total_capital?: number
          updated_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: string | null
          linkedfrom: string | null
          created_at: string | null
          password: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string | null
          linkedfrom?: string | null
          created_at?: string | null
          password?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: string | null
          linkedfrom?: string | null
          created_at?: string | null
          password?: string | null
        }
      }
      salary_payouts: {
        Row: {
          id: number
          employee_id: number | null
          month: string
          amount: number
          note: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          employee_id?: number | null
          month: string
          amount: number
          note?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          employee_id?: number | null
          month?: string
          amount?: number
          note?: string | null
          created_at?: string | null
        }
      }
      landingpage_config: {
        Row: {
          id: number
          phone: string | null
          address: string | null
          fanpage_url: string | null
          telegram_token: string | null
          telegram_chat_id: string | null
          fb_pixel_id: string | null
          tiktok_pixel_id: string | null
          gtm_id: string | null
          hotline_number: string | null
          map_iframe_url: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          phone?: string | null
          address?: string | null
          fanpage_url?: string | null
          telegram_token?: string | null
          telegram_chat_id?: string | null
          fb_pixel_id?: string | null
          tiktok_pixel_id?: string | null
          gtm_id?: string | null
          hotline_number?: string | null
          map_iframe_url?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          phone?: string | null
          address?: string | null
          fanpage_url?: string | null
          telegram_token?: string | null
          telegram_chat_id?: string | null
          fb_pixel_id?: string | null
          tiktok_pixel_id?: string | null
          gtm_id?: string | null
          hotline_number?: string | null
          map_iframe_url?: string | null
          updated_at?: string | null
        }
      }
    }
  }
}
