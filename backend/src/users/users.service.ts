import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getProfile(user: User): Promise<Partial<User>> {
    return this.sanitize(user);
  }

  async update(user: User, dto: UpdateUserDto): Promise<Partial<User>> {
    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  async updateAvatar(user: User, filename: string): Promise<Partial<User>> {
    user.avatarUrl = `/uploads/${filename}`;
    const saved = await this.usersRepo.save(user);
    return this.sanitize(saved);
  }

  private sanitize(user: User): Partial<User> {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
