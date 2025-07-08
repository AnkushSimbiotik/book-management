import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BooksService } from 'src/services/books.service';
import { TopicsService } from 'src/services/topics.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('stats')
export class StatsController {
  constructor(
    private readonly booksService: BooksService,
    private readonly topicsService: TopicsService,
  ) {}

  @Get('total-books')
  async totalBooks() {
    return this.booksService.totalBooks();
  }

  @Get('total-topics')
  async totalTopics() {
    return this.topicsService.totalTopics();
  }

  @Get('topic-wise-books/:topicId')
  async totalBooksByTopic(@Param('topicId') topicId: string) {
    return this.topicsService.getBooksByTopicId(topicId);
  }
}
