import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class AppendRejectionSnapshotDto {
  @ApiProperty({
    description: 'รหัสไฟล์ (file id) ของ snapshot ที่ generate ตอนตีกลับ',
    type: [Number],
    example: [101, 102],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  fileIds: number[];
}
