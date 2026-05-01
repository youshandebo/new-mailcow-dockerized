import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=admin.d.ts.map