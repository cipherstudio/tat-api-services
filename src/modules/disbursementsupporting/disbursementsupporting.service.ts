import { Injectable, NotFoundException } from '@nestjs/common';
import { DisbursementSupportingDocumentTypeRepository } from './repositories/disbursement-supporting-document-type.repository';
import { DisbursementSupportingFormRepository } from './repositories/disbursement-supporting-form.repository';
import { DisbursementSupportingQuestionRepository } from './repositories/disbursement-supporting-question.repository';
import { CreateDisbursementSupportingDocumentTypeDto } from './dto/create-disbursement-supporting-document-type.dto';
import { CreateDisbursementSupportingFormDto } from './dto/create-disbursement-supporting-form.dto';
import { CreateDisbursementSupportingQuestionDto } from './dto/create-disbursement-supporting-question.dto';

@Injectable()
export class DisbursementsupportingService {
  constructor(
    private readonly documentTypeRepo: DisbursementSupportingDocumentTypeRepository,
    private readonly formRepo: DisbursementSupportingFormRepository,
    private readonly questionRepo: DisbursementSupportingQuestionRepository,
  ) {}

  // Document Types
  async createDocumentType(dto: CreateDisbursementSupportingDocumentTypeDto) {
    return this.documentTypeRepo.create(dto);
  }
  async findAllDocumentTypes() {
    const types = await this.documentTypeRepo.find();
    const typesWithForms = await Promise.all(
      types.map(async (type) => {
        const forms = await this.formRepo.find({ document_type_id: type.id });
        return { ...type, forms };
      }),
    );
    return typesWithForms;
  }
  async findDocumentTypeById(id: number) {
    const found = await this.documentTypeRepo.findById(id);
    if (!found) throw new NotFoundException('Document type not found');
    const forms = await this.formRepo.find({ document_type_id: id });
    return { ...found, forms };
  }

  // Forms
  async createForm(dto: CreateDisbursementSupportingFormDto) {
    return this.formRepo.create(dto);
  }
  async findAllForms() {
    const forms = await this.formRepo.find();
    const formsWithQuestions = await Promise.all(
      forms.map(async (form) => {
        const questions = await this.questionRepo.find({ form_id: form.id });
        return { ...form, questions };
      }),
    );
    return formsWithQuestions;
  }
  async findFormById(id: number) {
    const found = await this.formRepo.findById(id);
    if (!found) throw new NotFoundException('Form not found');
    const questions = await this.questionRepo.find({ form_id: id });
    return { ...found, questions };
  }
  async findFormsByDocumentType(documentTypeId: number) {
    return this.formRepo.find({ document_type_id: documentTypeId });
  }
  async updateForm(id: number, dto: any) {
    const found = await this.formRepo.findById(id);
    if (!found) throw new NotFoundException('Form not found');
    return this.formRepo.update(id, dto);
  }

  // Questions
  async createQuestion(dto: CreateDisbursementSupportingQuestionDto) {
    return this.questionRepo.create(dto);
  }
  async findAllQuestions() {
    return this.questionRepo.find();
  }
  async findQuestionById(id: number) {
    const found = await this.questionRepo.findById(id);
    if (!found) throw new NotFoundException('Question not found');
    return found;
  }
  async findQuestionsByForm(formId: number) {
    return this.questionRepo.find({ formId });
  }
}
