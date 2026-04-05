import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ride } from './entities/ride.entity';
import { Booking } from './entities/booking.entity';
import { WaitlistEntry } from './entities/waitlist-entry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Ride, Booking, WaitlistEntry],
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl: { rejectUnauthorized: false },
        logging: true,
      }),
    }),
  ],
})
export class AppModule {}