import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { Ride, RideStatus } from '../entities/ride.entity';
import { WaitlistEntry, WaitlistStatus } from '../entities/waitlist-entry.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
    @InjectRepository(Ride)
    private ridesRepo: Repository<Ride>,
    @InjectRepository(WaitlistEntry)
    private waitlistRepo: Repository<WaitlistEntry>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async book(rideId: string, passenger: User): Promise<Booking> {
    return this.dataSource.transaction(async (manager) => {
      // Lock the ride row so no two bookings happen simultaneously
      const ride = await manager
        .getRepository(Ride)
        .createQueryBuilder('ride')
        .setLock('pessimistic_write')
        .where('ride.id = :id', { id: rideId })
        .getOne();

      if (!ride) throw new NotFoundException('Ride not found');
      if (ride.status === RideStatus.CANCELLED) {
        throw new BadRequestException('This ride has been cancelled');
      }
      if (ride.driverId === passenger.id) {
        throw new BadRequestException('Drivers cannot book their own ride');
      }

      // Check for existing confirmed booking
      const existing = await manager.getRepository(Booking).findOne({
        where: { rideId, passengerId: passenger.id, status: BookingStatus.CONFIRMED },
      });
      if (existing) throw new ConflictException('You already have a booking for this ride');

      if (ride.availableSeats <= 0) {
        throw new ConflictException(
          'No seats available. Use POST /api/waitlist/:rideId to join the waitlist.',
        );
      }

      // Decrement seat and create booking atomically
      ride.availableSeats -= 1;
      await manager.getRepository(Ride).save(ride);

      const booking = manager.getRepository(Booking).create({
        rideId,
        passengerId: passenger.id,
        status: BookingStatus.CONFIRMED,
      });

      return manager.getRepository(Booking).save(booking);
    });
  }

  async cancel(bookingId: string, user: User): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.getRepository(Booking).findOne({
        where: { id: bookingId },
      });

      if (!booking) throw new NotFoundException('Booking not found');
      if (booking.passengerId !== user.id) {
        throw new ForbiddenException('This is not your booking');
      }
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already cancelled');
      }

      // Cancel the booking
      booking.status = BookingStatus.CANCELLED;
      await manager.getRepository(Booking).save(booking);

      // Free up the seat
      const ride = await manager.getRepository(Ride).findOne({
      where: { id: booking.rideId },
      });
      if (!ride) throw new NotFoundException('Ride not found');
      ride.availableSeats += 1;
      await manager.getRepository(Ride).save(ride);

      // Promote first person on waitlist if any
      const next = await manager
        .getRepository(WaitlistEntry)
        .createQueryBuilder('w')
        .where('w.rideId = :rideId', { rideId: booking.rideId })
        .andWhere('w.status = :status', { status: WaitlistStatus.WAITING })
        .orderBy('w.position', 'ASC')
        .limit(1)
        .getOne();

      if (next) {
        // Create a confirmed booking for the waitlisted passenger
        const newBooking = manager.getRepository(Booking).create({
          rideId: booking.rideId,
          passengerId: next.passengerId,
          status: BookingStatus.CONFIRMED,
        });
        await manager.getRepository(Booking).save(newBooking);

        // Use the freed seat
        ride.availableSeats -= 1;
        await manager.getRepository(Ride).save(ride);

        // Mark waitlist entry as promoted
        next.status = WaitlistStatus.PROMOTED;
        await manager.getRepository(WaitlistEntry).save(next);
      }

      return { message: 'Booking cancelled successfully' };
    });
  }

  async getMyBookings(user: User): Promise<Booking[]> {
    return this.bookingsRepo.find({
      where: { passengerId: user.id },
      relations: ['ride', 'ride.driver'],
      order: { bookedAt: 'DESC' },
    });
  }
}
