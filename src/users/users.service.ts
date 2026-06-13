import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserRequest } from './dto/create-user.request';
import * as bcrypt from 'bcrypt'
import { PrismaService } from '@/prisma/prisma.service';
import { User } from '@/generated/prisma/client';

@Injectable()
export class UsersService {

  constructor(private readonly prismaService: PrismaService) { }
  async createUser(data: CreateUserRequest): Promise<Partial<User>> {

    try {
      return await this.prismaService.user.create({
        data: {
          ...data,
          password: await bcrypt.hash(data.password, 10)

        },
        select: {
          email: true,
          id: true
        }
      }

      )
    } catch (e) {
      console.error(e)
      if (e.code == 'P2002') {
        throw new UnprocessableEntityException('Email already exists')
      }
      throw e
    }

  }
}
