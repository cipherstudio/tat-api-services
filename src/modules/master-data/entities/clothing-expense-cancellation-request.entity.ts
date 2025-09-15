export class ClothingExpenseCancellationRequest {
  id: number;
  approval_id: number;
  attachment_id?: number;
  comment?: string;
  creator_code: string;
  creator_name: string;
  status: 'pending' | 'approved' | 'rejected';
  selected_staff_ids?: number[];
  created_at: Date;
  updated_at: Date;
}
