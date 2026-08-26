import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateReviewDto, @CurrentUser('id') userId: string) {
    const data = await this.reviewsService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Review created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('project/:projectId')
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.reviewsService.findByProject(
      projectId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Reviews retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('project/:projectId/user')
  @HttpCode(HttpStatus.OK)
  async findUserReview(@Param('projectId') projectId: string, @CurrentUser('id') userId?: string) {
    if (!userId) {
      return {
        statusCode: HttpStatus.OK,
        message: 'User review retrieved successfully',
        data: null,
        timestamp: new Date().toISOString(),
      };
    }
    const data = await this.reviewsService.findUserReview(projectId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User review retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('project/:projectId/stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@Param('projectId') projectId: string) {
    const data = await this.reviewsService.getProjectStats(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Review stats retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.reviewsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Review retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateReviewDto, @CurrentUser() user: any) {
    const data = await this.reviewsService.update(id, dto, user.id, user.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Review updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.reviewsService.remove(id, user.id, user.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Review deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
