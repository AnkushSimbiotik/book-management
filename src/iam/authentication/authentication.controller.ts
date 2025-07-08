// authentication.controller.ts
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Get,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { RequestPasswordResetDto } from './dto/requestPasswordReset.dto';
import { VerifyResetOtpDto } from './dto/verifyRequestOtp.dto';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { ApiTags } from '@nestjs/swagger';


@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Public()
  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Patch(':id/updatePassword')
  async updatePassword(
    @Param('id') id: string,
    @Body() dto: UpdatePasswordDto,
  ) {
    return this.authService.updatePassword(id, dto);
  }

  @Public()
  @Post('/forgetPassword')
  async forgetPassword(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.forgotPassword(requestPasswordResetDto);
  }

  @Public()
  @Post('/verify-otp')
  async verifyOtp(@Body() dto: VerifyResetOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
