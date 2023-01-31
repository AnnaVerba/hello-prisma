import { BadRequestException, Injectable } from '@nestjs/common';

import { Post, Prisma } from '@prisma/client';
import { PrismaService } from './app.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async post(
    postWhereUniqueInput: Prisma.PostWhereUniqueInput,
  ): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: postWhereUniqueInput,
    });
  }

  async posts(params: {
    where: Prisma.PostWhereInput;
  }): Promise<[Post[], object]> {
    const [posts, totalPosts] = await this.prisma.$transaction([
      this.prisma.post.findMany(params),
      this.prisma.post.count(),
    ]);
    return [posts, { count: totalPosts }];
  }

  async createPost(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({
      data,
    });
  }
  getQueryFromSearchPhrase(searchPhrase: string) {
    const searchOptions = /[()|&:*!]/g;
    return searchPhrase
      .replace(searchOptions, ' ')
      .trim()
      .split(/\s+/)
      .join(' | ');
  }
  async findAllPostsByValue(value) {
    const query = this.getQueryFromSearchPhrase(value);
    //   const results = await this.prisma.$queryRaw`
    //   SELECT * FROM "Post"
    //   WHERE
    //     "textSearch" @@ to_tsquery('english', ${query})
    //   ORDER BY ts_rank("textSearch", to_tsquery('english', ${query})) DESC
    //   LIMIT 10;
    // `;
    const results = await this.prisma.post.findMany({
      where: {
        OR: [
          {
            author: { name: { contains: value } },
          },
          {
            title: { contains: value },
          },
          {
            content: { contains: value },
          },
        ],
      },
    });
    return results;
  }

  async updatePost(where, data): Promise<Post> {
    return this.prisma.post.update({
      data,
      where,
    });
  }

  async deletePost(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    if (this.prisma.post.findFirst({ where: where })) {
      throw new BadRequestException('Post doesnt exist');
    }
    return this.prisma.post.delete({
      where,
    });
  }
}
