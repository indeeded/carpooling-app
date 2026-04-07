import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ride } from './entities/ride.entity';
import { Booking } from './entities/booking.entity';
import { WaitlistEntry } from './entities/waitlist-entry.entity';
import { AuthModule } from './auth/auth.module';
import { RidesModule } from './rides/rides.module';
import { BookingsModule } from './bookings/bookings.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { UsersModule } from './users/users.module';

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
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        logging: true,
      }),
    }),
    AuthModule,
    RidesModule,
    BookingsModule,
    WaitlistModule,
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}