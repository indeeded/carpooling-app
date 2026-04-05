import {
  IsString,
  IsInt,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MinLength,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRideDto {
  @IsString()
  @MinLength(2)
  origin: string;

  @IsString()
  @MinLength(2)
  destination: string;

  @IsDateString()
  departureAt: string;

  @IsInt()
  @Min(1)
  @Max(8)
  @Type(() => Number)
  totalSeats: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerSeat: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
