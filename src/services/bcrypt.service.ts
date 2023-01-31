import * as bcrypt from 'bcryptjs';
import { BadRequestException, Injectable } from '@nestjs/common';
@Injectable()
export class BcryptService {
  async hash(password): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async compare(password, hash): Promise<void> {
    const match = await bcrypt.compare(password, hash);
    if (!match) {
      throw new BadRequestException('The password did not match');
    }
  }
}
