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
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ScopesGuard } from '../../common/guards/scopes.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Scopes } from '../../common/decorators/scopes.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiKeyScope } from '@prisma/client';

@Controller('licenses')
export class LicensesController {
  constructor(private readonly licensesService: LicensesService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.licensesService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Licenses retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':shortId')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('shortId') shortId: string) {
    const data = await this.licensesService.findOne(shortId);
    return {
      statusCode: HttpStatus.OK,
      message: 'License retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':shortId/text')
  @HttpCode(HttpStatus.OK)
  async getText(@Param('shortId') shortId: string) {
    const data = await this.licensesService.getText(shortId);
    return {
      statusCode: HttpStatus.OK,
      message: 'License text retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ScopesGuard)
  @Roles('ADMIN')
  @Scopes(ApiKeyScope.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateLicenseDto) {
    const data = await this.licensesService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'License created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
