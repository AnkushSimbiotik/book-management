import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { TopicsService } from '../services/topics.service';
import { CreateTopicDto, UpdateTopicDto } from '../dtos/create-topic.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('/')
  create(@Body() createTopicDto: CreateTopicDto) {
    return this.topicsService.create(createTopicDto);
  }

  @Get()
  findAll() {
    return this.topicsService.findAll();
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
    return this.topicsService.update(id, updateTopicDto);
  }

  @Put(':id')
  remove(@Param('id') id: string) {
    return this.topicsService.softDelete(id);
  }
}
