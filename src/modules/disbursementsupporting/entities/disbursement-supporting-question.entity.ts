export interface DisbursementSupportingQuestion {
  id: number;
  formId: number;
  questionText: string;
  questionContent?: any; // JSON structured content
  createdAt: Date;
  updatedAt: Date;
}

export const disbursementSupportingQuestionColumnMap = {
  id: 'id',
  form_id: 'formId',
  question_text: 'questionText',
  question_content: 'questionContent',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

export const disbursementSupportingQuestionReverseColumnMap = {
  id: 'id',
  formId: 'form_id',
  questionText: 'question_text',
  questionContent: 'question_content',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};
