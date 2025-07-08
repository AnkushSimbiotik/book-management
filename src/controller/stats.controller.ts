import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/common/pagination.dto';
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

  @Get('topic-wise-books')
  async totalBooksByTopic(@Param() paginationDto : PaginationQueryDto) {
    return this.booksService.getTopicsAndBooksGrouped(paginationDto);
  }
}
