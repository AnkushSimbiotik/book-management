import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTopicDto, UpdateTopicDto } from '../dtos/create-topic.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from 'src/schema/book.schema';
import { Topic } from 'src/schema/topic.schema';
import { PaginationQueryDto } from 'src/common/pagination.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectModel(Topic.name)
    private readonly topicModel: Model<Topic>,
    @InjectModel(Book.name)
    private readonly bookModel: Model<Book>,
  ) {}
  create(createTopicDto: CreateTopicDto) {
    const topic = new this.topicModel(createTopicDto);
    return topic.save();
  }

  async findAll(pagination: PaginationQueryDto) {
  const { offset = 1, limit = 10, sort } = pagination;

  const skip = (offset - 1) * limit;

  // Dynamic sort parsing: genre:asc,description:desc
  let sortObject = {};
  if (sort) {
    sortObject = sort.split(',').reduce((acc, pair) => {
      const [field, direction] = pair.split(':');
      acc[field] = direction === 'desc' ? -1 : 1;
      return acc;
    }, {});
  }

  const query = this.topicModel.find().skip(skip).limit(limit).sort(sortObject);

  const topics = await query.exec();

  return topics.map((topic) => ({
    id: topic._id,
    genre: topic.genre,
    description: topic.description,
  }));
}


  async findOne(id: string) {
    const coffee = await this.topicModel.findOne({ _id: id }).exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async update(id: string, updateTopicDto: UpdateTopicDto) {
    const existingTopic = await this.topicModel
      .findOneAndUpdate({ _id: id }, { $set: updateTopicDto }, { new: true })
      .exec();

    if (!existingTopic) {
      throw new NotFoundException(`Topic #${id} not found`);
    }
    return existingTopic;
  }

  async softDelete(id: string) {
    const topic = await this.topicModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
    if (!topic) {
      throw new NotFoundException(`Topic #${id} not found`);
    }
    return topic;
  }

  async totalTopics() {
    const total = await this.topicModel.countDocuments().exec();
    if (total === 0) {
      throw new NotFoundException('No Topics found');
    }
    return { total };
  }

  async getBooksByTopicId(topicId: string) {
    const books = await this.bookModel.find({ topics: topicId }).exec();

    if (!books || books.length === 0) {
      throw new NotFoundException(`No books found with topicId ${topicId}`);
    }

    return books;
  }
}
