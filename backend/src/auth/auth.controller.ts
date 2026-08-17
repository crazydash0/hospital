import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('register-doctor')
  @Public()
  registerDoctor(@Body() body: RegisterDoctorDto) {
    return this.authService.registerDoctor(body);
  }

  @Post('login')
  @Public()
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
