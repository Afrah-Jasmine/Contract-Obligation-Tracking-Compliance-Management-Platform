export type NotificationStatus = 'Unread' | 'Read';
export type NotificationType = 'Obligation Due' | 'Obligation Overdue' | 'Renewal Reminder' | 'System';

export interface Notification {
  id: number;
  user_id: number;
  contract_id?: number;
  obligation_id?: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  scheduled_at?: string;
  read_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface NotificationCreate {
  user_id: number;
  contract_id?: number;
  obligation_id?: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  scheduled_at?: string;
}
