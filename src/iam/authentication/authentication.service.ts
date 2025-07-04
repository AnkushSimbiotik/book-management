import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';

import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/schema/user.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import jwtConfig from '../config/jwt.config';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const existingUser = await this.userModel.findOne({
        email: signUpDto.email,
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      const user = new this.userModel({
        username: signUpDto.username,
        email: signUpDto.email,
        password: await this.hashingService.hash(signUpDto.password),
      });

      const savedUser = await user.save();

      return {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
      };
    } catch (err) {
      console.error('SignUp Error:', err); // Debug log
      if (err.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw err;
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userModel.findOne({ email: signInDto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new ConflictException('Invalid password');
    }
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        audience: this.jwtConfiguration?.audience?.toString() ?? '',
        issuer: this.jwtConfiguration.issuer?.toString() ?? '',
        secret: this.jwtConfiguration.secret?.toString() ?? '',
        expiresIn: this.jwtConfiguration.accessTokenTtl?.toString() ?? '',
      },
    );
    return { accessToken };
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const isMatch = await this.hashingService.compare(
      dto.newPassword,
      user.password,
    );
    if (!isMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    user.password = await this.hashingService.hash(dto.newPassword);
    await user.save();
    return { message: 'Password updated successfully' };
  }
}
