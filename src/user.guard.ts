import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './app.service';
import { JwtService } from './services';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Invalid auth headers');
    }
    let email;
    try {
      email = this.jwtService.verifyAccess(accessToken).email;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.FORBIDDEN);
    }

    request.user = await this.prisma.user.findUnique({
      where: { email: email },
    });

    return !!request.user;
  }
}
