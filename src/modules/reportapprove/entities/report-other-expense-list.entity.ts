export interface Receipt {
  id: string;
  detail: string;
  amount: number;
}

export interface ReportOtherExpenseList {
  listId: number;
  reportId: number;
  expenseId: string;
  name: string;
  requestAmount: number;
  actualAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportOtherExpenseListReceipt {
  receiptId: number;
  listId: number;
  receiptDetailId: string;
  detail: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
