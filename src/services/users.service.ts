import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/create-user.dto';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User } from 'src/schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll() {
    return await this.userModel
      .find()
      .exec()
      .then((users) => {
        return users.map((user) => ({
          id: user._id,
          username: user.username,
          email: user.email,
        }));
      });
  }

  async findOne(id: string) {
    let userById = await this.userModel.findOne({ _id: id }).exec();
    if (!userById) {
      return `User with id ${id} not found`;
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
      return `User with id ${id} not found`;
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
    return await user.save().then((updatedUser) => {
      return {
        id: updatedUser._id,
        username: updatedUser.username,
      };
    });
  }

  async remove(id: string) {
    const user = await this.userModel.findOne({ _id: id }).exec();
    if (!user) {
      return `User with id ${id} not found`;
    }
    await user.deleteOne();
    return `User with id ${id} removed`;
  }
}
