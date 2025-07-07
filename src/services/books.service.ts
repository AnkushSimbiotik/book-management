import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaginationQueryDto } from 'src/common/pagination.dto';
import { CreateBookDto, UpdateBookDto } from 'src/dtos/create-book.dto';
import { Book } from 'src/schema/book.schema';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}

  create(createBookDto: CreateBookDto) {
    const newBook = new this.bookModel(createBookDto);
    return newBook.save();
  }

  async findAll(pagination: PaginationQueryDto) {
    const { offset = 1, limit = 10, sort } = pagination;

    // Convert sort string to Mongoose sort object
    let sortObject = {};
    if (sort) {
      sortObject = sort.split(',').reduce((acc, pair) => {
        const [key, direction] = pair.split(':');
        acc[key] = direction === 'desc' ? -1 : 1;
        return acc;
      }, {});
    }
    const totalElements = await this.bookModel.countDocuments();
    const totalPages = Math.ceil(totalElements / limit);

    const query = this.bookModel
      .find()
      .skip((offset - 1) * limit)
      .limit(limit)
      .sort(sortObject)
      .populate('topics')
      .exec();

    return {
      
      page: {
        number: offset,
        size: limit,
        totalElements,
        totalPages,
      },
      query,
    };
  }

  async findOne(id: string) {
    const book = await this.bookModel
      .findOne({ _id: id })
      .populate('topics')
      .exec();
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const existingBook = await this.bookModel
      .findOneAndUpdate(
        { _id: id },
        { $set: { ...updateBookDto, updatedAt: Date.now() } },
        { new: true, runValidators: true },
      )
      .exec();
    if (!existingBook) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return existingBook;
  }

  async softDelete(id: string) {
    const book = await this.bookModel
      .findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true })
      .exec();
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }
    return book;
  }

  async totalBooks() {
    const total = await this.bookModel.countDocuments().exec();
    if (total === 0) {
      throw new NotFoundException('No Books found');
    }
    return { total };
  }
}
