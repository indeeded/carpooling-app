import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ride, RideStatus } from '../entities/ride.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(Ride)
    private ridesRepo: Repository<Ride>,
  ) {}

  async create(dto: CreateRideDto, driver: User): Promise<Ride> {
    if (driver.role !== UserRole.DRIVER) {
      throw new ForbiddenException('Only drivers can create rides');
    }

    const ride = this.ridesRepo.create({
      ...dto,
      departureAt: new Date(dto.departureAt),
      availableSeats: dto.totalSeats,
      driverId: driver.id,
    });

    return this.ridesRepo.save(ride);
  }

  async findAll(query: SearchRideDto): Promise<Ride[]> {
    const qb = this.ridesRepo
      .createQueryBuilder('ride')
      .leftJoinAndSelect('ride.driver', 'driver')
      .where('ride.status = :status', { status: RideStatus.ACTIVE })
      .andWhere('ride.departureAt > :now', { now: new Date() })
      .orderBy('ride.departureAt', 'ASC');

    if (query.origin) {
      qb.andWhere('LOWER(ride.origin) LIKE LOWER(:origin)', {
        origin: `%${query.origin}%`,
      });
    }

    if (query.destination) {
      qb.andWhere('LOWER(ride.destination) LIKE LOWER(:destination)', {
        destination: `%${query.destination}%`,
      });
    }

    if (query.date) {
      const day = new Date(query.date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      qb.andWhere('ride.departureAt >= :day AND ride.departureAt < :nextDay', {
        day,
        nextDay,
      });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<Ride> {
    const ride = await this.ridesRepo.findOne({
      where: { id },
      relations: ['driver', 'bookings', 'bookings.passenger', 'waitlistEntries'],
    });

    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  async update(id: string, dto: UpdateRideDto, user: User): Promise<Ride> {
    const ride = await this.findOne(id);

    if (ride.driverId !== user.id) {
      throw new ForbiddenException('You can only edit your own rides');
    }

    if (ride.status === RideStatus.CANCELLED) {
      throw new BadRequestException('Cannot edit a cancelled ride');
    }

    Object.assign(ride, {
      ...dto,
      departureAt: dto.departureAt ? new Date(dto.departureAt) : ride.departureAt,
    });

    return this.ridesRepo.save(ride);
  }

  async remove(id: string, user: User): Promise<{ message: string }> {
    const ride = await this.findOne(id);

    if (ride.driverId !== user.id) {
      throw new ForbiddenException('You can only delete your own rides');
    }

    ride.status = RideStatus.CANCELLED;
    await this.ridesRepo.save(ride);

    return { message: 'Ride cancelled successfully' };
  }

  async getMyRides(driver: User): Promise<Ride[]> {
    return this.ridesRepo.find({
      where: { driverId: driver.id },
      relations: ['bookings', 'bookings.passenger', 'waitlistEntries'],
      order: { departureAt: 'DESC' },
    });
  }
}
