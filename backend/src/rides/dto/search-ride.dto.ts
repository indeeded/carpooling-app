import { IsOptional, IsString, IsDateString } from 'class-validator';

export class SearchRideDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
