// authentication.service.ts
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

import { UpdatePasswordDto } from './dto/update-password.dto';
import jwtConfig from '../config/jwt.config';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { VerificationToken } from 'src/schema/verificationToken.schema';
import { User } from 'src/schema/user.schema';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(VerificationToken.name)
    private readonly verificationTokenModel: Model<VerificationToken>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
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
        status: 'pending', // Set status to pending
      });

      const savedUser = await user.save();

      // Generate verification token (JWT)
      const verificationToken = await this.jwtService.signAsync(
        { sub: savedUser._id, email: savedUser.email, type: 'verification' },
        {
          secret: this.jwtConfiguration.secret,
          expiresIn: '1h', // Token expires in 1 hour
        },
      );

      // Save verification token
      const tokenDoc = new this.verificationTokenModel({
        token: verificationToken,
        user: savedUser._id,
        expiresAt: new Date(Date.now() + 1000 * 60 ), // Token expires in 1 minute
      });
      await tokenDoc.save();

      // Send verification email
      const verificationUrl = `${this.configService.get<string>('APP_URL')}/authentication/verify?token=${verificationToken}`;
      await this.mailerService.sendMail({
        to: signUpDto.email,
        subject: 'Verify Your Email',
        html: `
          <h2>Email Verification</h2>
          <p>Please click the link below to verify your email:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 1 minute.</p>
        `,
      });

      return {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        message: 'Verification email sent',
      };
    } catch (err) {
      console.error('SignUp Error:', err);
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
    if (user.status !== 'verified') {
      throw new BadRequestException('Please verify your email first');
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
        sub: user._id,
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

  async verifyEmail(token: string) {
    // Verify JWT token
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.jwtConfiguration.secret,
    });

    const tokenDoc = await this.verificationTokenModel.findOne({ token });
    if (!tokenDoc) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (tokenDoc.expiresAt < new Date()) {
      await this.userModel.findOneAndDelete({ _id: tokenDoc.user });
      await this.verificationTokenModel.deleteOne({ _id: tokenDoc.id });
      throw new BadRequestException('Token has expired');
    }

    const user = await this.userModel.findById(tokenDoc.user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'verified') {
      throw new BadRequestException('Email already verified');
    }

    user.status = 'verified';
    await user.save();
    await this.verificationTokenModel.deleteOne({ token });

    return { message: 'Email verified successfully' };
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

  async cleanupExpiredTokens() {
    const now = new Date();
    const expiredTokens = await this.verificationTokenModel
      .find({
        expiresAt: { $lt: now },
      })
      .populate<{ user: User }>('user');
    // Delete expired tokens
    for (const tokenDoc of expiredTokens) {
      if (tokenDoc.user && tokenDoc.user.status === 'pending') {
        // ...existing code...
        //  @ts-ignore
        await this.userModel.deleteOne({ _id: tokenDoc.user._id });
      }
      await this.verificationTokenModel.deleteOne({ _id: tokenDoc._id });
    }
    return { message: 'Expired tokens and pending users cleaned up' };
  }
}
