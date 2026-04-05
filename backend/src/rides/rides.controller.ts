import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto } from './dto/create-ride.dto';
import { UpdateRideDto } from './dto/update-ride.dto';
import { SearchRideDto } from './dto/search-ride.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rides')
export class RidesController {
  constructor(private ridesService: RidesService) {}

  // Public — anyone can browse rides
  @Get()
  findAll(@Query() query: SearchRideDto) {
    return this.ridesService.findAll(query);
  }

  // Public — anyone can view a ride
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  // Protected — driver only
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateRideDto, @Request() req) {
    return this.ridesService.create(dto, req.user);
  }

  // Protected — owner only
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRideDto, @Request() req) {
    return this.ridesService.update(id, dto, req.user);
  }

  // Protected — owner only (soft delete, sets status to cancelled)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Request() req) {
    return this.ridesService.remove(id, req.user);
  }

  // Protected — driver sees their own rides with passenger lists
  @UseGuards(JwtAuthGuard)
  @Get('driver/me')
  getMyRides(@Request() req) {
    return this.ridesService.getMyRides(req.user);
  }
}
