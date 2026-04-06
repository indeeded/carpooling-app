import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // Book a seat on a ride
  @Post('rides/:rideId/book')
  book(@Param('rideId') rideId: string, @Request() req) {
    return this.bookingsService.book(rideId, req.user);
  }

  // Cancel a booking (triggers waitlist promotion)
  @Delete('bookings/:id')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user);
  }

  // Passenger dashboard — see all my bookings
  @Get('bookings/me')
  getMyBookings(@Request() req) {
    return this.bookingsService.getMyBookings(req.user);
  }
}
