import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/create-user.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schema/user.schema';
import { PaginationQueryDto } from 'src/common/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(pagination: PaginationQueryDto) {
    const { offset = 1, limit = 10, sort } = pagination;

    // Parse sort string to object
    let sortObject = {};
    if (sort) {
      sortObject = sort.split(',').reduce((acc, pair) => {
        const [key, direction] = pair.split(':');
        acc[key] = direction === 'desc' ? -1 : 1;
        return acc;
      }, {});
    }

    const skip = (offset - 1) * limit;

    const query = this.userModel.find().skip(skip).limit(limit).sort(sortObject);

    const users = await query.exec();
    const total = await this.userModel.countDocuments().exec();

    return {
      data: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
      })),
      meta: {
        offset,
        limit,
        count: users.length,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const userById = await this.userModel.findById(id).exec();
    if (!userById) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return {
      id: userById._id,
      username: userById.username,
      email: userById.email,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const allowedFields = ['username'];
    const updateKeys = Object.keys(updateUserDto);

    const invalidKeys = updateKeys.filter(
      (key) => !allowedFields.includes(key),
    );
    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Only 'username' can be updated. Invalid fields: ${invalidKeys.join(', ')}`,
      );
    }

    if (updateUserDto.username !== undefined) {
      user.username = updateUserDto.username;
    }

    const updatedUser = await user.save();

    return {
      id: updatedUser._id,
      username: updatedUser.username,
    };
  }

  async remove(id: string) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    await user.deleteOne();
    return `User with id ${id} removed`;
  }
}
