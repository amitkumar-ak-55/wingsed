import { Module } from '@nestjs/common';
import { TypesenseService } from './typesense.service';
import { TypesenseController } from './typesense.controller';

@Module({
  controllers: [TypesenseController],
  providers: [TypesenseService],
  exports: [TypesenseService],
})
export class TypesenseModule {}
