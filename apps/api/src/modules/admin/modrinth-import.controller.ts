import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ModrinthImportService } from './modrinth-importer.service';

class SyncDto {
  /** Optional per-type cap. Omit to import the full default plan (~62 projects). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limitPerType?: number;
}

/**
 * Admin-only trigger for the Modrinth catalog importer. Imports the most
 * downloaded projects of every type with real versions, files, icons and
 * gallery images. Safe to re-run — existing slugs are updated in place.
 */
@Controller('admin/integrations/modrinth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
export class ModrinthImportController {
  constructor(private readonly importer: ModrinthImportService) {}

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(@Body() dto: SyncDto) {
    const data = await this.importer.sync(dto.limitPerType);
    return {
      statusCode: HttpStatus.OK,
      message: 'Modrinth import complete',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
