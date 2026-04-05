import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Ride } from './ride.entity';
import { Booking } from './booking.entity';
import { WaitlistEntry } from './waitlist-entry.entity';

export enum UserRole {
  DRIVER = 'driver',
  PASSENGER = 'passenger',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  @Exclude()
  passwordHash: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'avatar_url', nullable: true, type: 'varchar' })
  avatarUrl: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PASSENGER })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Ride[];

  @OneToMany(() => Booking, (booking) => booking.passenger)
  bookings: Booking[];

  @OneToMany(() => WaitlistEntry, (entry) => entry.passenger)
  waitlistEntries: WaitlistEntry[];
}
