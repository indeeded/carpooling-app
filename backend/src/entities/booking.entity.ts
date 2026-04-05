import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Ride } from './ride.entity';

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
@Unique(['rideId', 'passengerId']) // one booking per passenger per ride
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id' })
  rideId: string;

  @Column({ name: 'passenger_id' })
  passengerId: string;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.CONFIRMED,
  })
  status: BookingStatus;

  @CreateDateColumn({ name: 'booked_at' })
  bookedAt: Date;

  // Relations
  @ManyToOne(() => Ride, (ride) => ride.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;
}
