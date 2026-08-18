import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthProvider } from '@prisma/client';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register') @Public() register(@Body() body: RegisterDto) { return this.authService.register(body); }
  @Post('register-doctor') @Public() registerDoctor(@Body() body: RegisterDoctorDto) { return this.authService.registerDoctor(body); }
  @Post('login') @Public() login(@Body() body: LoginDto) { return this.authService.login(body); }
  @Post('verify-email') @Public() verifyEmail(@Body() body: { email: string; code: string }) { return this.authService.verifyEmail(body.email, body.code); }
  @Post('resend-email-verification') @Public() resendEmailVerification(@Body() body: { email: string }) { return this.authService.resendEmailVerification(body.email); }
  @Post('phone/request-code') @Public() requestPhoneCode(@Body() body: { phone: string }) { return this.authService.requestPhoneVerification(body.phone); }
  @Post('phone/verify-code') @Public() verifyPhoneCode(@Body() body: { phone: string; code: string; fullName?: string }) { return this.authService.verifyPhone(body.phone, body.code, body.fullName); }

  @Get('google') @Public() async google(@Res() res: Response) {
    const clientId = process.env.GOOGLE_CLIENT_ID; const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !redirectUri) throw new UnauthorizedException('Google login is not configured');
    const state = await this.authService.createOAuthState(AuthProvider.GOOGLE);
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile', state, access_type: 'online', prompt: 'select_account' });
    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  }

  @Get('google/callback') @Public() async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) { return this.finishOAuth(AuthProvider.GOOGLE, code, state, res); }
  @Get('facebook') @Public() async facebook(@Res() res: Response) {
    const clientId = process.env.FACEBOOK_APP_ID; const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    if (!clientId || !redirectUri) throw new UnauthorizedException('Facebook login is not configured');
    const state = await this.authService.createOAuthState(AuthProvider.FACEBOOK);
    const params = new URLSearchParams({ client_id: clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'email,public_profile', state });
    return res.redirect(`https://www.facebook.com/v20.0/dialog/oauth?${params}`);
  }
  @Get('facebook/callback') @Public() async facebookCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) { return this.finishOAuth(AuthProvider.FACEBOOK, code, state, res); }

  @Post('switch-clinic') @UseGuards(JwtAuthGuard) switchClinic(@Req() req: any, @Body('clinicId') clinicId: number) {
    const id = Number(clinicId); if (!Number.isInteger(id) || id <= 0) throw new UnauthorizedException('Invalid clinic');
    return this.authService.getClinicContext(req.user.userId, id);
  }

  private async finishOAuth(provider: AuthProvider, code: string, state: string, res: Response) {
    if (!code || !state) throw new UnauthorizedException('Missing OAuth response');
    await this.authService.consumeOAuthState(state, provider);
    let result;
    if (provider === AuthProvider.GOOGLE) {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: process.env.GOOGLE_REDIRECT_URI!, grant_type: 'authorization_code' }) });
      if (!tokenResponse.ok) throw new UnauthorizedException('Google authentication failed');
      const tokens = await tokenResponse.json() as { access_token: string };
      const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${tokens.access_token}` } });
      if (!profileResponse.ok) throw new UnauthorizedException('Unable to read Google profile');
      const profile = await profileResponse.json() as { sub: string; email?: string; name?: string; email_verified?: boolean };
      if (!profile.email || profile.email_verified === false) throw new UnauthorizedException('Google account has no verified email');
      result = await this.authService.loginWithOAuth(provider, profile.sub, profile.email, profile.name ?? 'Patient');
    } else {
      const tokenResponse = await fetch('https://graph.facebook.com/v20.0/oauth/access_token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, redirect_uri: process.env.FACEBOOK_REDIRECT_URI!, code }) });
      if (!tokenResponse.ok) throw new UnauthorizedException('Facebook authentication failed');
      const tokens = await tokenResponse.json() as { access_token: string };
      const profileResponse = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(tokens.access_token)}`);
      if (!profileResponse.ok) throw new UnauthorizedException('Unable to read Facebook profile');
      const profile = await profileResponse.json() as { id: string; name?: string; email?: string };
      result = await this.authService.loginWithOAuth(provider, profile.id, profile.email ?? null, profile.name ?? 'Patient');
    }
    const frontend = process.env.FRONTEND_URL;
    if (!frontend) return res.json(result);
    return res.redirect(`${frontend.replace(/\/$/, '')}/oauth-callback#token=${encodeURIComponent(result.access_token)}`);
  }
}
