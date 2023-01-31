import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { PrismaService } from './services/app.service';
import { PostService } from './services/post.service';
import { UserService } from './services/user.service';
import { PostController } from './controllers/post.controller';
import { BcryptService, JwtService } from './services';

@Module({
  controllers: [UserController, PostController],
  providers: [
    PrismaService,
    PostService,
    UserService,
    JwtService,
    BcryptService,
  ],
})
export class AppModule {}
