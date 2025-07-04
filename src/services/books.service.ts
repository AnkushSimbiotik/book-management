import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { CreateBookDto, UpdateBookDto } from 'src/dtos/create-book.dto';
import { Book } from 'src/schema/book.schema';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<Book>) {}
  create(createBookDto: CreateBookDto) {
    const newBook = new this.bookModel(createBookDto);
    return newBook.save();
  }

  async findAll() {
    return await this.bookModel.find().populate('topics').exec();
  }

  async findOne(id: string) {
    return await this.bookModel
      .findOne({ _id: id })
      .populate('topics')
      .exec()
      .then((book) => {
        if (!book) {
          throw new Error(`Book #${id} not found`);
        }
        return book;
      });
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    const existingBook = await this.bookModel
      .findOneAndUpdate({ _id: id }, { $set: updateBookDto }, { new: true })
      .exec();
    if (!existingBook) {
      throw new NotFoundException(`Book #${id} not found`);
    }
    return existingBook;
  }

  async softDelete(id: string) {
    const book = await this.bookModel
      .findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true })
      .exec();
    if (!book) {
      throw new NotFoundException(`Book #${id} not found`);
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
