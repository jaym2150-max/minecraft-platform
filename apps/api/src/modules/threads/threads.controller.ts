import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiKeyScope } from '@prisma/client';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

class PostMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(10000)
  body!: string;
}

@Controller('threads')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('mine')
  @Scopes(ApiKeyScope.USER_READ, ApiKeyScope.READ)
  @HttpCode(HttpStatus.OK)
  async listMine(@CurrentUser('id') userId: string) {
    const data = await this.threadsService.listMine(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Threads retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @Scopes(ApiKeyScope.USER_READ, ApiKeyScope.READ)
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.threadsService.findOne(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Thread retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/messages')
  @Scopes(ApiKeyScope.USER_WRITE, ApiKeyScope.WRITE)
  @HttpCode(HttpStatus.CREATED)
  async postMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PostMessageDto,
  ) {
    const data = await this.threadsService.postMessage(id, userId, dto.body);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Message posted successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
