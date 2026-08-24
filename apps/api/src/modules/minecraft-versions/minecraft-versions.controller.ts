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
import { MinecraftVersionsService } from './minecraft-versions.service';
import { CreateMinecraftVersionDto } from './dto/create-mc-version.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('minecraft-versions')
export class MinecraftVersionsController {
  constructor(private readonly service: MinecraftVersionsService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const data = await this.service.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Minecraft versions retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('stable')
  @HttpCode(HttpStatus.OK)
  async findStable() {
    const data = await this.service.findStable();
    return {
      statusCode: HttpStatus.OK,
      message: 'Stable Minecraft versions retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Minecraft version retrieved successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMinecraftVersionDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Minecraft version created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Minecraft version deleted successfully',
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
