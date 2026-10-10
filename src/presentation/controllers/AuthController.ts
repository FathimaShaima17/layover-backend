import { Request, Response, NextFunction } from 'express';
import {
  RegisterUseCase,
  LoginUseCase,
  GetProfileUseCase,
  UpdateProfileUseCase,
} from '../../application/use-cases/AuthUseCases';
import { RegisterDto, LoginDto, UpdateProfileDto } from '../../application/dto/AuthDto';

/**
 * AuthController
 *
 * Presentation layer — handles HTTP request/response lifecycle
 * for authentication. Delegates all business logic to use-cases.
 */
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUseCase,
    private readonly loginUser: LoginUseCase,
    private readonly getProfile: GetProfileUseCase,
    private readonly updateProfile: UpdateProfileUseCase
  ) {}

  // POST /api/auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterDto;
      const result = await this.registerUser.execute({
        name: dto.name,
        email: dto.email,
        password: dto.password,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  // POST /api/auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginDto;
      const result = await this.loginUser.execute({
        email: dto.email,
        password: dto.password,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  // GET /api/auth/me  (requires Authorization: Bearer <token>)
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.getProfile.execute(req.user?.id ?? '');
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  // PATCH /api/auth/profile  (requires Authorization: Bearer <token>)
  patchProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as UpdateProfileDto;
      const user = await this.updateProfile.execute(req.user?.id ?? '', {
        name: dto.name,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
      });
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}
