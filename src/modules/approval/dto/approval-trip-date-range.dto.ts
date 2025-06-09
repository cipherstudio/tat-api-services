import { ApiProperty } from "@nestjs/swagger"; 
import { IsDateString, IsOptional } from "class-validator"; 
export class ApprovalTripDateRangeDto { 
    @ApiProperty({ 
        description: "Start date of the trip", 
        example: "2024-03-01", 
        required: false, 
    }) 
    @IsOptional() 
    @IsDateString() 
    start?: string; 
    
    @ApiProperty({ 
        description: "End date of the trip", 
        example: "2024-03-05", 
        required: false, 
    }) 
    
    @IsOptional() 
    @IsDateString() 
    end?: string; }
