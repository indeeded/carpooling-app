import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Check,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';
import { WaitlistEntry } from './waitlist-entry.entity';

export enum RideStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('rides')
@Check(`"available_seats" >= 0`)
@Check(`"available_seats" <= "total_seats"`)
export class Ride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id' })
  driverId: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column({ name: 'departure_at', type: 'timestamptz' })
  departureAt: Date;

  @Column({ name: 'total_seats', type: 'int' })
  totalSeats: number;

  @Column({ name: 'available_seats', type: 'int' })
  availableSeats: number;

  @Column({ name: 'price_per_seat', type: 'decimal', precision: 8, scale: 2 })
  pricePerSeat: number;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.ACTIVE,
  })
  status: RideStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.rides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @OneToMany(() => Booking, (booking) => booking.ride)
  bookings: Booking[];

  @OneToMany(() => WaitlistEntry, (entry) => entry.ride)
  waitlistEntries: WaitlistEntry[];

  // Computed helper
  get isFull(): boolean {
    return this.availableSeats === 0;
  }
}
