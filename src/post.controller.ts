import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { Post as PostModel, User } from '@prisma/client';
import { HttpUser } from './User.decorator';
import { UserGuard } from './user.guard';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('all')
  @UseGuards(UserGuard)
  async allUserPosts(@HttpUser() user: User): Promise<[PostModel[], object]> {
    return this.postService.posts({ where: { authorId: user.id } });
  }
  @Post('create')
  @UseGuards(UserGuard)
  async createPost(@HttpUser() user: User, @Body() body) {
    body.authorId = user.id;
    return this.postService.createPost(body);
  }
  @Get('search')
  async searchByValue(@Query('value') value) {
    return this.postService.findAllPostsByValue(value);
  }
  @Delete(':id')
  async deletePost(@Param('id') id) {
    id = Number(id);
    return this.postService.deletePost({ id });
  }
  @Post('updatePost/:id')
  @UseGuards(UserGuard)
  async updatePostUser(
    @HttpUser() user: User,
    @Param('id') postId: number,
    @Body() body,
  ) {
    return this.postService.updatePost(
      { where: { authorId: user.id } },
      { body },
    );
  }
}
