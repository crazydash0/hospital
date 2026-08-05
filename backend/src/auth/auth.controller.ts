import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() body: RegisterDto) {
    console.log('CONTROLLER BODY:', body);
    return this.authService.register(body);
  }
  @Post('login')
  @Public()
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
