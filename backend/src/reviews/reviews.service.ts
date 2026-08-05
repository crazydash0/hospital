import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { GetDoctorReviewsDto } from './dto/get-doctor-reviews.dto';
import { ModerationAction } from '../common/profanity/moderation/enums/moderation-action.enum';
import { ModerationService } from '../common/profanity/moderation/moderation.service';
import { AccessControlService } from '../common/profanity/access-control/access-control.service';
import { JwtUser } from '../common/profanity/access-control/type/jwt-user';
import { Role } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private moderation: ModerationService,
    private readonly accessControl: AccessControlService,
  ) {}

  async updateReview(
    currentUser: JwtUser,
    reviewId: number,
    dto: UpdateReviewDto,
  ) {
    const review = await this.accessControl.verifyReviewAccess(
      reviewId,
      currentUser,
    );
    if (review.doctorReply) {
      throw new BadRequestException(
        'You cannot edit a review after the doctor has replied.',
      );
    }
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: dto,
    });
  }
  async deleteReview(currentUser: JwtUser, reviewId: number) {
    await this.accessControl.verifyReviewAccess(reviewId, currentUser);
    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
    return {
      message: 'Review deleted successfully',
    };
  }

  async createReview(currentUser: JwtUser, dto: CreateReviewDto) {
    const appointment = await this.accessControl.verifyAppointmentAccess(
      dto.appointmentId,
      currentUser,
    );

    const patient = await this.prisma.patient.findUnique({
      where: {
        userId: currentUser.userId,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const moderation = await this.moderation.moderate(dto.comment);

    if (moderation.action === ModerationAction.REJECT) {
      throw new BadRequestException(moderation.reason);
    }
    const existingReview = await this.prisma.review.findUnique({
      where: {
        appointmentId: appointment.id,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'Review already exists for this appointment',
      );
    }

    return this.prisma.review.create({
      data: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        patientId: appointment.patientId,

        rating: dto.rating,
        comment: dto.comment,

        isAnonymous: dto.isAnonymous ?? false,
      },
    });
  }
  async getDoctorReviews(doctorId: number, query: GetDoctorReviewsDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: {
        id: doctorId,
      },
      include: {
        user: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const skip = (query.page - 1) * query.limit;

    const aggregate = await this.prisma.review.aggregate({
      where: {
        doctorId,
        isHidden: false,
      },

      _avg: {
        rating: true,
      },

      _count: true,
    });

    const grouped = await this.prisma.review.groupBy({
      by: ['rating'],

      where: {
        doctorId,
        isHidden: false,
      },

      _count: true,
    });

    const stars = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    grouped.forEach((g) => {
      stars[g.rating] = g._count;
    });

    const reviews = await this.prisma.review.findMany({
      where: {
        doctorId,
        isHidden: false,
      },

      include: {
        patient: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

      skip,

      take: query.limit,
    });

    const data = reviews.map((review) => ({
      id: review.id,

      rating: review.rating,

      comment: review.comment,

      doctorReply: review.doctorReply,

      createdAt: review.createdAt,

      patient: review.isAnonymous
        ? {
            name: 'Anonymous',
          }
        : {
            id: review.patient.id,
            fullName: review.patient.fullName,
          },
    }));

    return {
      doctor: {
        id: doctor.id,
        specialty: doctor.specialty,
      },

      statistics: {
        averageRating: aggregate._avg.rating ?? 0,

        totalReviews: aggregate._count,

        fiveStars: stars[5],

        fourStars: stars[4],

        threeStars: stars[3],

        twoStars: stars[2],

        oneStar: stars[1],
      },

      reviews: data,

      pagination: {
        page: query.page,
        limit: query.limit,
      },
    };
  }
  async replyReview(
    currentUser: JwtUser,
    reviewId: number,
    dto: ReplyReviewDto,
  ) {
    await this.accessControl.verifyReviewAccess(reviewId, currentUser);
    if (currentUser.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can reply to reviews');
    }
    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        doctorReply: dto.reply,
        repliedAt: new Date(),
      },
    });
  }
}
