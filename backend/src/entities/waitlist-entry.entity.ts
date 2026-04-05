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

export enum WaitlistStatus {
  WAITING = 'waiting',
  PROMOTED = 'promoted', // got a seat
  EXPIRED = 'expired',   // left the queue manually
}

@Entity('waitlist_entries')
@Unique(['rideId', 'passengerId']) // one entry per passenger per ride
export class WaitlistEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ride_id' })
  rideId: string;

  @Column({ name: 'passenger_id' })
  passengerId: string;

  @Column({ type: 'int' })
  position: number;

  @Column({
    type: 'enum',
    enum: WaitlistStatus,
    default: WaitlistStatus.WAITING,
  })
  status: WaitlistStatus;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  // Relations
  @ManyToOne(() => Ride, (ride) => ride.waitlistEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ride_id' })
  ride: Ride;

  @ManyToOne(() => User, (user) => user.waitlistEntries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;
}
