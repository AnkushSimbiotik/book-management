import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto/sign-in.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Controller('authentication')
export class AuthenticationController {
    constructor(private readonly authService: AuthenticationService) {}

    @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @HttpCode(HttpStatus.OK) // by default @Post does 201, we wanted 200 - hence using @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

 @Patch(':id/password')
async updatePassword(
  @Param('id') id: string,
  @Body() dto: UpdatePasswordDto,
) {
  return this.authService.updatePassword(id , dto);
}

} 
