import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  let repositoryMock: {
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repositoryMock = {
      findOne: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('returns an active user with the requested id', async () => {
      const user = { id: 'user-1', isActive: true } as User;
      repositoryMock.findOne.mockResolvedValue(user);

      await expect(service.findById('user-1')).resolves.toBe(user);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1', isActive: true },
      });
    });

    it('throws when the user does not exist or is inactive', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(service.findById('missing-user')).rejects.toThrow(
        'User tidak ditemukan',
      );
    });
  });

  describe('findByFirebaseUid', () => {
    it('looks up an active user by Firebase UID', async () => {
      const user = { firebaseUid: 'firebase-1', isActive: true } as User;
      repositoryMock.findOne.mockResolvedValue(user);

      await expect(service.findByFirebaseUid('firebase-1')).resolves.toBe(user);
      expect(repositoryMock.findOne).toHaveBeenCalledWith({
        where: { firebaseUid: 'firebase-1', isActive: true },
      });
    });
  });

  describe('findByIdentifier', () => {
    it('uses email lookup when the identifier contains @', async () => {
      const user = { email: 'cashier@example.com' } as User;
      const findByEmail = vi
        .spyOn(service, 'findByEmail')
        .mockResolvedValue(user);
      const findByPhone = vi.spyOn(service, 'findByPhone');

      await expect(
        service.findByIdentifier('cashier@example.com'),
      ).resolves.toBe(user);
      expect(findByEmail).toHaveBeenCalledWith('cashier@example.com');
      expect(findByPhone).not.toHaveBeenCalled();
    });

    it('uses phone lookup when the identifier does not contain @', async () => {
      const user = { phone: '+628123456789' } as User;
      const findByPhone = vi
        .spyOn(service, 'findByPhone')
        .mockResolvedValue(user);
      const findByEmail = vi.spyOn(service, 'findByEmail');

      await expect(service.findByIdentifier('08123456789')).resolves.toBe(user);
      expect(findByPhone).toHaveBeenCalledWith('08123456789');
      expect(findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('normalizes the phone number and saves the updated user', async () => {
      const user = {
        id: 'user-1',
        phone: '+628111111111',
        isActive: true,
      } as User;
      repositoryMock.findOne.mockResolvedValue(user);
      repositoryMock.save.mockImplementation(
        async (updatedUser) => updatedUser,
      );

      const result = await service.update('user-1', {
        fullName: 'Updated Name',
        phone: '08123456789',
      });

      expect(repositoryMock.save).toHaveBeenCalledWith({
        ...user,
        fullName: 'Updated Name',
        phone: '+628123456789',
      });
      expect(result).toBe(user);
    });

    it('throws when updating a user that does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(
        service.update('missing-user', { fullName: 'Updated Name' }),
      ).rejects.toThrow('User tidak ditemukan');
      expect(repositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the found user and returns null', async () => {
      const user = { id: 'user-1', isActive: true } as User;
      repositoryMock.findOne.mockResolvedValue(user);
      repositoryMock.delete.mockResolvedValue({ affected: 1 });

      await expect(service.delete('user-1')).resolves.toBeNull();
      expect(repositoryMock.delete).toHaveBeenCalledWith('user-1');
    });

    it('throws when deleting a user that does not exist', async () => {
      repositoryMock.findOne.mockResolvedValue(null);

      await expect(service.delete('missing-user')).rejects.toThrow(
        'User tidak ditemukan',
      );
      expect(repositoryMock.delete).not.toHaveBeenCalled();
    });
  });
});
