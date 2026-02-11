import { Module } from '@nestjs/common';
import { SavedUniversitiesController } from './saved-universities.controller';
import { SavedUniversitiesService } from './saved-universities.service';

@Module({
  controllers: [SavedUniversitiesController],
  providers: [SavedUniversitiesService],
  exports: [SavedUniversitiesService],
})
export class SavedUniversitiesModule {}
