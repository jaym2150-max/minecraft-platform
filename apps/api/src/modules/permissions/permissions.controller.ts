import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

class CreatePermissionDto {
  @IsString() key!: string;
  @IsOptional() @IsString() description?: string;
}

class UpsertRolePermissionDto {
  @IsString() permissionId!: string;
  @IsBoolean() granted!: boolean;
}

class UpsertUserOverrideDto {
  @IsString() permissionId!: string;
  @IsBoolean() granted!: boolean;
  @IsOptional() @IsString() reason?: string;
}

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissions: PermissionsService) {}

  @Public()
  @Get()
  async list() {
    const data = await this.permissions.list();
    return {
      statusCode: HttpStatus.OK,
      message: 'Permissions retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Post('seed')
  @HttpCode(HttpStatus.OK)
  async seed() {
    const result = await this.permissions.seedDefaults();
    return {
      statusCode: HttpStatus.OK,
      message: 'Permissions seeded',
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePermissionDto) {
    const data = await this.permissions.createPermission(dto.key, dto.description);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Permission created',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.permissions.deletePermission(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Permission deleted',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Patch('role/:role')
  async setRole(@Param('role') role: string, @Body() dto: UpsertRolePermissionDto) {
    const data = await this.permissions.setRolePermission(
      role as any,
      dto.permissionId,
      dto.granted,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Role permission updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Get('user/:userId')
  async userOverrides(@Param('userId') userId: string) {
    const data = await this.permissions.listUserOverrides(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User overrides retrieved',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Post('user/:userId')
  @HttpCode(HttpStatus.OK)
  async setUserOverride(
    @Param('userId') userId: string,
    @Body() dto: UpsertUserOverrideDto,
    @CurrentUser('id') actorId: string,
  ) {
    const data = await this.permissions.setUserOverride(
      userId,
      dto.permissionId,
      dto.granted,
      dto.reason ?? null,
      actorId,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User override updated',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @Delete('user/:userId/:permissionId')
  async removeUserOverride(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.permissions.removeUserOverride(userId, permissionId);
    return {
      statusCode: HttpStatus.OK,
      message: 'User override removed',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
