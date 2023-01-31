import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from './app.service';
import { PostService } from './post.service';
import { UserService } from './user.service';
import { PostController } from './post.controller';
import { BcryptService, JwtService } from './services';

@Module({
  imports: [],
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
