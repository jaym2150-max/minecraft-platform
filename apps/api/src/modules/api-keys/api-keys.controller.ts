import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiKeyScope } from '@prisma/client';

@Controller('api-keys')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Scopes(ApiKeyScope.WRITE, ApiKeyScope.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateApiKeyDto, @CurrentUser('id') userId: string) {
    const result = await this.apiKeysService.create(userId, dto.name, dto.scopes);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'API key created successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser('id') userId: string) {
    const data = await this.apiKeysService.findAll(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'API keys retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.apiKeysService.findOne(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'API key retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @Scopes(ApiKeyScope.DELETE, ApiKeyScope.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const data = await this.apiKeysService.remove(id, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'API key revoked successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
