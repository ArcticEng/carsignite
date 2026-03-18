// ═══ TypeScript Types ═══
export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city?: string;
  province: string;
  tier: 'ignite' | 'apex' | 'dynasty';
  role: 'member' | 'admin';
  status: string;
  avatar_url?: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  member_id: string;
  tier: string;
  amount: number;
  status: string;
  payfast_token?: string;
  next_billing?: string;
  first_name?: string;
  last_name?: string;
}

export interface Draw {
  id: string;
  tier: string;
  prize_name: string;
  prize_desc?: string;
  prize_value: number;
  winner_id: string;
  winner_name: string;
  winner_city?: string;
  total_entrants: number;
  total_entries: number;
  audit_ref: string;
  draw_date: string;
}

export interface Message {
  id: string;
  member_id: string;
  channel: string;
  content: string;
  message_type: string;
  metadata?: string;
  first_name: string;
  last_name: string;
  tier: string;
  created_at: string;
}

export interface DriveEvent {
  id: string;
  name: string;
  description?: string;
  drive_type: string;
  date: string;
  start_time?: string;
  distance?: string;
  max_cars: number;
  registration_count: number;
  is_registered: boolean;
}

export interface DriveGroup {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  invite_code: string;
  creator_id: string;
  member_count: number;
  members?: GroupMember[];
}

export interface GroupMember {
  member_id: string;
  first_name: string;
  last_name: string;
  tier: string;
}

export interface Prize {
  tier: string;
  current: { name: string; desc?: string; value?: number; image?: string };
  upcoming?: { name?: string; desc?: string; value?: number; image?: string };
  drawDateHint?: string;
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  type: string;
  read: number;
  created_at: string;
}

export interface TierConfig {
  n: string;
  p: number;
  icon: string;
  c: string;
  badge: string;
  prize: string;
  freq: string;
  entries: number;
  pop?: boolean;
  features: string[];
}
