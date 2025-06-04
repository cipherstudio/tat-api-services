import { CommitteePosition } from '../entities/committee-position.entity';
import { CreateCommitteePositionDto, UpdateCommitteePositionDto } from '../dto/committee-position.dto';

export interface ICommitteePositionRepository {
  findAll(): Promise<CommitteePosition[]>;
  findById(id: number): Promise<CommitteePosition>;
  create(data: CreateCommitteePositionDto): Promise<CommitteePosition>;
  update(id: number, data: UpdateCommitteePositionDto): Promise<CommitteePosition>;
  delete(id: number): Promise<void>;
} 