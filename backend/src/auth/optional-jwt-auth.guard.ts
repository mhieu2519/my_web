import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard này không bắt buộc đăng nhập: nếu có token hợp lệ thì gắn req.user,
// nếu không có/token sai thì vẫn cho qua với req.user = null (không throw lỗi).
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        return user || null;
    }
}