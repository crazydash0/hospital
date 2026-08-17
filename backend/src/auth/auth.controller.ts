import { Body, Controller, Post, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() body: RegisterDto) { return this.authService.register(body); }

  @Post('register-doctor')
  @Public()
  registerDoctor(@Body() body: RegisterDoctorDto) { return this.authService.registerDoctor(body); }

  @Post('login')
  @Public()
  login(@Body() body: LoginDto) { return this.authService.login(body); }

  @Post('switch-clinic')
  @UseGuards(JwtAuthGuard)
  switchClinic(@Req() req: any, @Body('clinicId') clinicId: number) {
    const id = Number(clinicId);
    if (!Number.isInteger(id) || id <= 0) throw new UnauthorizedException('Invalid clinic');
    return this.authService.getClinicContext(req.user.userId, id);
  }
}
