// iam.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schema/user.schema';
// Import VerificationToken schema
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer'; // Import MailerModule
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { VerificationToken, VerificationTokenSchema } from 'src/schema/verificationToken.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from 'src/common/scheduler/cron.service';
import { OtpToken, OtpTokenSchema } from 'src/schema/otp-token.schema';
import jwtConfig from 'src/common/config/jwt.config';

@Module({
   imports: [
    ConfigModule.forRoot({ isGlobal: true , load: [jwtConfig]}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationToken.name, schema: VerificationTokenSchema },
      {name : OtpToken.name , schema : OtpTokenSchema}
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_TTL') || '48h',
          audience: configService.get<string>('JWT_AUDIENCE'),
          issuer: configService.get<string>('JWT_ISSUER'),
        },
      }),
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: `"Book-management" <${configService.get<string>('EMAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [
    AuthenticationService,
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    CronService,
    // JwtService is already provided by JwtModule, so no need to add it explicitly
  ],
  controllers: [AuthenticationController],
})
export class IamModule {}