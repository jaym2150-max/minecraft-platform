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
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCommentDto, @CurrentUser('id') userId: string) {
    const data = await this.commentsService.create(dto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('project/:projectId')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findByProject(
    @Param('projectId') projectId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const { data, meta } = await this.commentsService.findByProject(
      projectId,
      Number(page),
      Number(limit),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Comments retrieved successfully',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Public()
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.commentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser() user: any,
  ) {
    const data = await this.commentsService.update(id, dto, user.id, user.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.commentsService.remove(id, user.id, user.role);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
