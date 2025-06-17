import { ApiProperty } from '@nestjs/swagger';

export interface Privilege {
  /**
   * The unique identifier for the privilege
   */
  id: number;

  /**
   * The name of the privilege
   */
  name: string;

  /**
   * Whether this privilege is a committee position
   */
  isCommitteePosition: boolean;

  /**
   * Whether this privilege is equivalent to an outsider
   */
  isOutsiderEquivalent: boolean;

  /**
   * When the privilege was created
   */
  createdAt: Date;

  /**
   * When the privilege was last updated
   */
  updatedAt: Date;
}

// Snake case to camel case mapping for database results
export const privilegeColumnMap = {
  id: 'id',
  name: 'name',
  is_committee_position: 'isCommitteePosition',
  is_outsider_equivalent: 'isOutsiderEquivalent',
  created_at: 'createdAt',
  updated_at: 'updatedAt',
};

// Camel case to snake case mapping for database inserts
export const privilegeReverseColumnMap = {
  id: 'id',
  name: 'name',
  isCommitteePosition: 'is_committee_position',
  isOutsiderEquivalent: 'is_outsider_equivalent',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
}; 