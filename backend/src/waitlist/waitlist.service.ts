import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitlistEntry, WaitlistStatus } from '../entities/waitlist-entry.entity';
import { Ride, RideStatus } from '../entities/ride.entity';
import { Booking, BookingStatus } from '../entities/booking.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class WaitlistService {
  constructor(
    @InjectRepository(WaitlistEntry)
    private waitlistRepo: Repository<WaitlistEntry>,
    @InjectRepository(Ride)
    private ridesRepo: Repository<Ride>,
    @InjectRepository(Booking)
    private bookingsRepo: Repository<Booking>,
  ) {}

  async join(rideId: string, passenger: User): Promise<WaitlistEntry> {
    const ride = await this.ridesRepo.findOne({ where: { id: rideId } });
    if (!ride) throw new NotFoundException('Ride not found');
    if (ride.status === RideStatus.CANCELLED) {
      throw new BadRequestException('Cannot join waitlist for a cancelled ride');
    }
    if (ride.driverId === passenger.id) {
      throw new BadRequestException('Drivers cannot join the waitlist for their own ride');
    }
    if (ride.availableSeats > 0) {
      throw new BadRequestException(
        'Ride still has seats available. Use POST /api/rides/:id/book instead.',
      );
    }

    // Check not already on waitlist
    const existingWaitlist = await this.waitlistRepo.findOne({
      where: { rideId, passengerId: passenger.id, status: WaitlistStatus.WAITING },
    });
    if (existingWaitlist) {
      throw new ConflictException('You are already on the waitlist for this ride');
    }

    // Check not already booked
    const existingBooking = await this.bookingsRepo.findOne({
      where: { rideId, passengerId: passenger.id, status: BookingStatus.CONFIRMED },
    });
    if (existingBooking) {
      throw new ConflictException('You already have a confirmed booking for this ride');
    }

    // Calculate position — next after the last waiting entry
    const last = await this.waitlistRepo
      .createQueryBuilder('w')
      .where('w.rideId = :rideId', { rideId })
      .andWhere('w.status = :status', { status: WaitlistStatus.WAITING })
      .orderBy('w.position', 'DESC')
      .limit(1)
      .getOne();

    const position = last ? last.position + 1 : 1;

    const entry = this.waitlistRepo.create({
      rideId,
      passengerId: passenger.id,
      position,
      status: WaitlistStatus.WAITING,
    });

    return this.waitlistRepo.save(entry);
  }

  async leave(entryId: string, user: User): Promise<{ message: string }> {
    const entry = await this.waitlistRepo.findOne({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Waitlist entry not found');
    if (entry.passengerId !== user.id) {
      throw new ForbiddenException('This is not your waitlist entry');
    }
    if (entry.status !== WaitlistStatus.WAITING) {
      throw new BadRequestException('You are no longer in the waiting queue');
    }

    entry.status = WaitlistStatus.EXPIRED;
    await this.waitlistRepo.save(entry);

    return { message: 'Removed from waitlist successfully' };
  }

  async getMyWaitlistEntries(user: User): Promise<WaitlistEntry[]> {
    return this.waitlistRepo.find({
      where: { passengerId: user.id, status: WaitlistStatus.WAITING },
      relations: ['ride', 'ride.driver'],
      order: { joinedAt: 'DESC' },
    });
  }
}
