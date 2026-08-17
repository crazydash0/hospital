import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';

interface ZoomTokenResponse {
  access_token: string;
  expires_in: number;
}

interface ZoomMeetingResponse {
  id: number;
  join_url: string;
  start_url: string;
}

@Injectable()
export class ZoomService {
  private cachedToken: string | null = null;
  private tokenExpiresAt = 0;

  private isConfigured(): boolean {
    return Boolean(
      process.env.ZOOM_ACCOUNT_ID &&
        process.env.ZOOM_CLIENT_ID &&
        process.env.ZOOM_CLIENT_SECRET,
    );
  }

  private async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableException(
        'خدمة Zoom غير مفعّلة بعد على السيرفر. من فضلك تواصل مع إدارة العيادة.',
      );
    }

    // استخدم التوكن المخزن لو لسه صالح
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const credentials = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
    ).toString('base64');

    const response = await fetch(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    if (!response.ok) {
      throw new InternalServerErrorException(
        'تعذر الاتصال بخدمة Zoom، تأكد من صحة بيانات الحساب.',
      );
    }

    const data = (await response.json()) as ZoomTokenResponse;
    this.cachedToken = data.access_token;
    // نطرح دقيقتين هامش أمان قبل انتهاء صلاحية التوكن
    this.tokenExpiresAt = Date.now() + (data.expires_in - 120) * 1000;

    return this.cachedToken;
  }

  async createMeeting(params: {
    topic: string;
    startTime: Date;
    durationMinutes: number;
  }): Promise<ZoomMeetingResponse> {
    const token = await this.getAccessToken();

    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.topic,
        type: 2, // موعد مجدول بوقت محدد
        start_time: params.startTime.toISOString(),
        duration: params.durationMinutes,
        timezone: 'Africa/Cairo',
        settings: {
          join_before_host: true,
          waiting_room: false,
          approval_type: 2,
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new InternalServerErrorException(
        `تعذر إنشاء اجتماع Zoom: ${errorBody}`,
      );
    }

    return (await response.json()) as ZoomMeetingResponse;
  }
}
