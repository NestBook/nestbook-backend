import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';
import * as tls from 'tls';
import { BookingEntity } from 'src/modules/booking/entity/booking.entity';
import { InvoiceEntity } from 'src/modules/invoice/entity/invoice.entity';
import { LoggerService } from '../logger/logger.service';

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type BookingMailContext = {
  hotelName?: string;
  roomTypeName?: string;
};

@Injectable()
export class MailService {
  private readonly context = MailService.name;
  private readonly timeoutMs = 15000;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  async sendBookingInvoice(
    booking: BookingEntity,
    invoice: InvoiceEntity,
    context: BookingMailContext = {},
  ): Promise<void> {
    if (!this.isConfigured()) {
      this.logger.warn('Mail is not configured; invoice email skipped', this.context);
      return;
    }

    const message = this.buildInvoiceMessage(booking, invoice, context);

    await this.send(message);

    this.logger.info('Invoice email sent', this.context, {
      bookingCode: booking.bookingCode,
      invoiceCode: invoice.invoiceCode,
      to: booking.guestEmail,
    });
  }

  private async send(message: MailMessage): Promise<void> {
    const host = this.required('MAIL_HOST');
    const port = Number(this.configService.get<string>('MAIL_PORT') ?? 587);
    const secure = this.configService.get<string>('MAIL_SECURE') === 'true';
    const user = this.required('MAIL_USER');
    const pass = this.required('MAIL_PASS');
    const from = this.configService.get<string>('MAIL_FROM') || user;

    let socket: net.Socket | tls.TLSSocket = secure
      ? tls.connect({ host, port, servername: host })
      : net.connect({ host, port });

    const smtp = new SmtpSession(socket, this.timeoutMs);

    try {
      await smtp.expect([220]);
      await smtp.command(`EHLO ${this.smtpDomain()}`, [250]);

      if (!secure) {
        await smtp.command('STARTTLS', [220]);
        socket = tls.connect({
          socket,
          servername: host,
        });
        smtp.replaceSocket(socket);
        await smtp.command(`EHLO ${this.smtpDomain()}`, [250]);
      }

      const auth = Buffer.from(`\u0000${user}\u0000${pass}`).toString('base64');
      await smtp.command(`AUTH PLAIN ${auth}`, [235]);
      await smtp.command(`MAIL FROM:<${this.extractEmail(from)}>`, [250]);
      await smtp.command(`RCPT TO:<${message.to}>`, [250, 251]);
      await smtp.command('DATA', [354]);
      await smtp.writeData(this.composeRawMessage(from, message));
      await smtp.expect([250]);
      await smtp.command('QUIT', [221]);
    } finally {
      socket.end();
    }
  }

  private buildInvoiceMessage(
    booking: BookingEntity,
    invoice: InvoiceEntity,
    context: BookingMailContext,
  ): MailMessage {
    const hotelName = context.hotelName ?? `Khach san #${booking.hotelId}`;
    const roomTypeName = context.roomTypeName ?? `Phong #${booking.roomTypeId}`;
    const checkIn = this.formatDate(booking.checkInDate);
    const checkOut = this.formatDate(booking.checkOutDate);
    const amount = this.formatMoney(Number(booking.finalAmount));

    const issuedAt = this.formatDate(invoice.issuedAt);
    const subject = `Hoa don booking ${booking.bookingCode}`;
    const text = [
      `Xin chao ${booking.guestName},`,
      '',
      'NestBook da xac nhan thanh toan booking cua ban.',
      `Ma hoa don: ${invoice.invoiceCode}`,
      `Ma booking: ${booking.bookingCode}`,
      `Khach san: ${hotelName}`,
      `Loai phong: ${roomTypeName}`,
      `Ngay nhan phong: ${checkIn}`,
      `Ngay tra phong: ${checkOut}`,
      `So luong phong: ${booking.quantity}`,
      `So dem: ${booking.nights}`,
      `Tong tien: ${amount}`,
      `Ngay xuat hoa don: ${issuedAt}`,
      `Trang thai thanh toan: ${booking.paymentStatus}`,
      '',
      'Cam on ban da su dung NestBook.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
        <h2 style="margin:0 0 16px">Hoa don booking ${booking.bookingCode}</h2>
        <p>Xin chao ${this.escapeHtml(booking.guestName)},</p>
        <p>NestBook da xac nhan thanh toan booking cua ban.</p>
        <table style="border-collapse:collapse;width:100%;max-width:560px">
          ${this.row('Ma hoa don', invoice.invoiceCode)}
          ${this.row('Ma booking', booking.bookingCode)}
          ${this.row('Khach san', hotelName)}
          ${this.row('Loai phong', roomTypeName)}
          ${this.row('Ngay nhan phong', checkIn)}
          ${this.row('Ngay tra phong', checkOut)}
          ${this.row('So luong phong', String(booking.quantity))}
          ${this.row('So dem', String(booking.nights))}
          ${this.row('Tong tien', amount)}
          ${this.row('Ngay xuat hoa don', issuedAt)}
          ${this.row('Trang thai thanh toan', booking.paymentStatus)}
        </table>
        <p style="margin-top:16px">Cam on ban da su dung NestBook.</p>
      </div>
    `;

    return {
      to: booking.guestEmail,
      subject,
      text,
      html,
    };
  }

  private composeRawMessage(from: string, message: MailMessage): string {
    const boundary = `nestbook-${Date.now()}`;
    const headers = [
      `From: ${from}`,
      `To: ${message.to}`,
      `Subject: ${this.encodeHeader(message.subject)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ];

    return [
      ...headers,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      message.text,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      message.html,
      '',
      `--${boundary}--`,
      '',
    ].join('\r\n');
  }

  private isConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('MAIL_HOST') &&
        this.configService.get<string>('MAIL_USER') &&
        this.configService.get<string>('MAIL_PASS'),
    );
  }

  private required(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} is required`);
    }

    return value;
  }

  private smtpDomain(): string {
    const user = this.configService.get<string>('MAIL_USER');
    return user?.split('@')[1] || 'localhost';
  }

  private extractEmail(value: string): string {
    const match = value.match(/<([^>]+)>/);
    return match?.[1] ?? value;
  }

  private encodeHeader(value: string): string {
    return `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;
  }

  private row(label: string, value: string): string {
    return `
      <tr>
        <td style="border:1px solid #e5e7eb;padding:8px;font-weight:600;background:#f9fafb">${this.escapeHtml(label)}</td>
        <td style="border:1px solid #e5e7eb;padding:8px">${this.escapeHtml(value)}</td>
      </tr>
    `;
  }

  private formatDate(value: Date): string {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  }

  private formatMoney(value: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

class SmtpSession {
  private socket: net.Socket | tls.TLSSocket;
  private buffer = '';
  private waiters: Array<{
    expectedCodes: number[];
    resolve: (line: string) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
  }> = [];

  constructor(socket: net.Socket | tls.TLSSocket, private readonly timeoutMs: number) {
    this.socket = socket;
    this.attachSocket();
  }

  replaceSocket(socket: net.Socket | tls.TLSSocket): void {
    this.socket.removeAllListeners('data');
    this.socket.removeAllListeners('error');
    this.socket.removeAllListeners('close');
    this.socket = socket;
    this.attachSocket();
  }

  async command(command: string, expectedCodes: number[]): Promise<string> {
    this.socket.write(`${command}\r\n`);
    return this.expect(expectedCodes);
  }

  async writeData(rawMessage: string): Promise<void> {
    const escaped = rawMessage.replace(/^\./gm, '..');
    this.socket.write(`${escaped}\r\n.\r\n`);
  }

  expect(expectedCodes: number[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`SMTP timeout waiting for ${expectedCodes.join('/')}`));
      }, this.timeoutMs);

      this.waiters.push({
        expectedCodes,
        resolve,
        reject,
        timer,
      });

      this.flush();
    });
  }

  private attachSocket(): void {
    this.socket.setEncoding('utf8');
    this.socket.on('data', (chunk: string) => {
      this.buffer += chunk;
      this.flush();
    });
    this.socket.on('error', (error) => this.rejectAll(error));
    this.socket.on('close', () => this.rejectAll(new Error('SMTP socket closed')));
  }

  private flush(): void {
    if (this.waiters.length === 0) {
      return;
    }

    const response = this.nextCompleteResponse();
    if (!response) {
      return;
    }

    const waiter = this.waiters.shift();
    if (!waiter) {
      return;
    }

    clearTimeout(waiter.timer);

    const code = Number(response.slice(0, 3));
    if (waiter.expectedCodes.includes(code)) {
      waiter.resolve(response);
      return;
    }

    waiter.reject(new Error(`Unexpected SMTP response: ${response}`));
  }

  private nextCompleteResponse(): string | null {
    const lines = this.buffer.split(/\r\n/);
    const completeIndex = lines.findIndex((line) => /^\d{3} /.test(line));

    if (completeIndex === -1) {
      return null;
    }

    const responseLines = lines.slice(0, completeIndex + 1);
    this.buffer = lines.slice(completeIndex + 1).join('\r\n');

    return responseLines.join('\n');
  }

  private rejectAll(error: Error): void {
    const waiters = this.waiters.splice(0);

    for (const waiter of waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(error);
    }
  }
}
