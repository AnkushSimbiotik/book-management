import { Controller, Get, Param } from '@nestjs/common';
import { BooksService } from 'src/services/books.service';
import { TopicsService } from 'src/services/topics.service';

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
