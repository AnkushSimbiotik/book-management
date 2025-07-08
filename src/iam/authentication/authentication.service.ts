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
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import jwtConfig from '../../common/config/jwt.config';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { VerificationToken } from 'src/schema/verificationToken.schema';
import { User } from 'src/schema/user.schema';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { OtpToken } from 'src/schema/otp-token.schema';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { VerifyResetOtpDto } from './dto/verifyRequestOtp.dto';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';

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
    @InjectModel(OtpToken.name)
    private readonly otpTokenModel: Model<OtpToken>,
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
        status: 'inactive', // Set status to pending
        isVerified: 'pending', // Align with User schema
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
        expiresAt: new Date(Date.now() + 1000 * 60 * 60), // Changed to 1 hour
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
        <p>This link will expire in 1 hour.</p>
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
    if (user.status !== 'active') {
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
        username: user.username,
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

    if (user.status === 'active') {
      throw new BadRequestException('Email already verified');
    }

    user.isVerified = 'verified';
    user.status = 'active';
    await user.save();
    await this.verificationTokenModel.deleteOne({ token });

    return { message: 'Email verified successfully' };
  }

  async updatePassword(id: string, dto: UpdatePasswordDto) {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const isOldPasswordCorrect = await this.hashingService.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isOldPasswordCorrect) {
      throw new BadRequestException('Old password is incorrect');
    }

    const isSameAsOld = await this.hashingService.compare(
      dto.newPassword,
      user.password,
    );

    if (isSameAsOld) {
      throw new BadRequestException(
        'New password must be different from the old password',
      );
    }

    user.password = await this.hashingService.hash(dto.newPassword);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status !== 'active' || user.isVerified !== 'verified') {
      throw new BadRequestException('Please verify your email first');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await this.hashingService.hash(otp);

    // Save OTP token
    const otpToken = new this.otpTokenModel({
      otp: hashedOtp,
      user: user._id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes expiration
    });
    await otpToken.save();

    // Send OTP email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <h2>Password Reset</h2>
        <p>Your OTP for password reset is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 15 minutes.</p>
      `,
    });

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(dto: VerifyResetOtpDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status !== 'active' || user.isVerified !== 'verified') {
      throw new BadRequestException('Please verify your email first');
    }

    const otpToken = await this.otpTokenModel.findOne({ user: user._id });
    if (!otpToken) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpToken.expiresAt < new Date()) {
      await this.otpTokenModel.deleteOne({ _id: otpToken._id });
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await this.hashingService.compare(dto.otp, otpToken.otp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    return { message: 'OTP verified successfully' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status !== 'active' || user.isVerified !== 'verified') {
      throw new BadRequestException('Please verify your email first');
    }

    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const otpToken = await this.otpTokenModel.findOne({ user: user._id });
    if (!otpToken) {
      throw new BadRequestException('Please verify OTP first');
    }

    user.password = await this.hashingService.hash(dto.newPassword);
    await user.save();
    await this.otpTokenModel.deleteOne({ _id: otpToken._id });

    return { message: 'Password reset successfully' };
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
    const expiredOtpTokens = await this.otpTokenModel.find({
      expiresAt: { $lt: now },
    });

    // Delete expired otp 

    for (const otpToken of expiredOtpTokens) {
      await this.otpTokenModel.deleteOne({ _id: otpToken._id });
    }
    return { message: 'Expired tokens and pending users cleaned up' };
  }
}
