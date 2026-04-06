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
import { WaitlistService } from './waitlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class WaitlistController {
  constructor(private waitlistService: WaitlistService) {}

  // Join the waitlist for a full ride
  @Post('waitlist/:rideId')
  join(@Param('rideId') rideId: string, @Request() req) {
    return this.waitlistService.join(rideId, req.user);
  }

  // Leave the waitlist
  @Delete('waitlist/:id')
  @HttpCode(HttpStatus.OK)
  leave(@Param('id') id: string, @Request() req) {
    return this.waitlistService.leave(id, req.user);
  }

  // See my waitlist entries
  @Get('waitlist/me')
  getMyEntries(@Request() req) {
    return this.waitlistService.getMyWaitlistEntries(req.user);
  }
}
