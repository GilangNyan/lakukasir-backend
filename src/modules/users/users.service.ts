import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { normalizePhoneNumber } from '../../utils/phone-normalizer.util.js';
import { hashPassword } from '../../utils/credential.util.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, isActive: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email, isActive: true } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    const normalizedPhone = normalizePhoneNumber(phone);
    return this.userRepository.findOne({
      where: { phone: normalizedPhone, isActive: true },
    });
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { firebaseUid, isActive: true },
    });
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    if (identifier.includes('@')) {
      return this.findByEmail(identifier);
    }
    return this.findByPhone(identifier);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, email, phone, password, firebaseUid } = createUserDto;

    if (!email && !phone) {
      throw new BadRequestException(
        'Minimal harus menyediakan Email atau Nomor Telepon',
      );
    }

    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;

    if (email) {
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) throw new ConflictException('Email sudah digunakan');
    }

    if (normalizedPhone) {
      const existingPhone = await this.findByPhone(normalizedPhone);
      if (existingPhone)
        throw new ConflictException('Nomor telepon sudah digunakan');
    }

    let passwordHash: string | undefined = undefined;
    if (password) {
      passwordHash = await hashPassword(password);
    }

    const user = this.userRepository.create({
      fullName,
      email: email || undefined,
      phone: normalizedPhone || undefined,
      password: passwordHash,
      firebaseUid: firebaseUid || undefined,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.phone) {
      updateUserDto.phone = normalizePhoneNumber(updateUserDto.phone);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<null> {
    const user = await this.findById(id);

    return this.userRepository.delete(user.id).then(() => null);
  }
}
