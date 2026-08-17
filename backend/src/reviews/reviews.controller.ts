import { Body, Controller, Param, Patch, Post, Req, UseGuards, Delete, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetDoctorReviewsDto } from './dto/get-doctor-reviews.dto';
import { Roles } from '../auth/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Public } from '../auth/public.decorator';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Get('doctor/:doctorId')
  @Public()
  getDoctorReviews(@Param('doctorId') doctorId: string, @Query() query: GetDoctorReviewsDto) {
    return this.service.getDoctorReviews(Number(doctorId), query);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  remove(@Req() req, @Param('id') id: string) { return this.service.deleteReview(req.user, Number(id)); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateReviewDto) { return this.service.updateReview(req.user, Number(id), dto); }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  create(@Req() req, @Body() dto: CreateReviewDto) { return this.service.createReview(req.user, dto); }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  reply(@Req() req, @Param('id') id: string, @Body() dto: ReplyReviewDto) { return this.service.replyReview(req.user, Number(id), dto); }
}
