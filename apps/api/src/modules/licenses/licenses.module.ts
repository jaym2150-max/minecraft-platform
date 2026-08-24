import { Module } from '@nestjs/common';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class LicensesModule {}
