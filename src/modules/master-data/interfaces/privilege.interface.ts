import { Privilege } from '../entities/privilege.entity';
import { CreatePrivilegeDto, UpdatePrivilegeDto } from '../dto/privilege.dto';

export interface IPrivilegeRepository {
  findAll(): Promise<Privilege[]>;
  findById(id: number): Promise<Privilege>;
  create(data: CreatePrivilegeDto): Promise<Privilege>;
  update(id: number, data: UpdatePrivilegeDto): Promise<Privilege>;
  delete(id: number): Promise<void>;
} 