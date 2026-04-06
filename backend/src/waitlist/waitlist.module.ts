import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { WaitlistEntry } from '../entities/waitlist-entry.entity';
import { Ride } from '../entities/ride.entity';
import { Booking } from '../entities/booking.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WaitlistEntry, Ride, Booking]),
    AuthModule,
  ],
  providers: [WaitlistService],
  controllers: [WaitlistController],
})
export class WaitlistModule {}
