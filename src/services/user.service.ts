import { BadRequestException, Injectable } from '@nestjs/common';

import { User, Prisma } from '@prisma/client';
import { PrismaService } from './app.service';
import { BcryptService, JwtService } from './index';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private bcryptService: BcryptService,
  ) {}
  exclude(user, ...keys) {
    for (const key of keys) {
      delete user[key];
    }
    return user;
  }
  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    // return this.exclude(user, 'password');
    return user;
  }
  async isolationLeveltest(data) {
    const MAX_RETRIES = 5;
    let retries = 0;
    let result;
    while (retries < MAX_RETRIES) {
      try {
        result = await this.prisma.$transaction(
          [
            this.prisma.user.deleteMany({
              where: {
                id: data.userId,
              },
            }),
            this.prisma.post.createMany({
              data: {
                ...data,
              },
            }),
          ],
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        if (error.code === 'P2034') {
          retries++;
          continue;
        }
        throw error;
      }
      return result;
    }
  }
  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data): Promise<{ accessToken; refreshToken }> {
    const exist = await this.prisma.user.findUnique({
      where: { email: data['email'] },
    });
    if (exist) {
      console.log(exist);
      throw new BadRequestException('User exist');
    }
    if (data.password) {
      data['password'] = await this.bcryptService.hash(data.password);
    }
    console.log(data);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        posts: {
          create: [
            {
              title: `New user!`,
              content: `User ${data.name || data.email} has create account`,
            },
          ],
        },
      },
    });
    console.log(user);
    const { accessToken, refreshToken } = this.jwtService.generateTokens({
      userId: user['id'],
      email: user['email'],
    });
    return { accessToken, refreshToken };
  }
  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser({ data }) {
    await this.prisma.$transaction(
      [this.prisma.user.deleteMany({ where: data })],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable, // optional, default defined by database configuration
      },
    );
  }
}
