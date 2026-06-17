export class ClothingExpenseCancellationRequest {
  id: number;
  approval_id: number;
  attachment_id?: number;
  comment?: string;
  creator_code: string;
  creator_name: string;
  status: 'pending' | 'approved' | 'rejected';
  selected_staff_ids?: number[];
  approved_by_code?: string | null;
  approved_by_name?: string | null;
  approved_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}
