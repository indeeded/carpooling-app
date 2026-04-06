import {
  IsString, IsInt, IsNumber, IsDateString,
  Min, Max, MinLength, IsOptional, registerDecorator,
  ValidationOptions, ValidationArguments
} from 'class-validator';
import { Type } from 'class-transformer';

function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return new Date(value) > new Date();
        },
        defaultMessage() {
          return 'Departure date must be in the future';
        },
      },
    });
  };
}

export class CreateRideDto {
  @IsString()
  @MinLength(2)
  origin: string;

  @IsString()
  @MinLength(2)
  destination: string;

  @IsDateString()
  @IsFutureDate()
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