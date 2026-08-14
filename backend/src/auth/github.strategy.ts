import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(config: ConfigService, private authService: AuthService) {
        super({
            clientID: config.get('GITHUB_CLIENT_ID'),
            clientSecret: config.get('GITHUB_CLIENT_SECRET'),
            callbackURL: config.get('GITHUB_CALLBACK_URL'),
            scope: ['user:email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile, done: any) {
        const email = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;
        const name = profile.displayName || profile.username || email;
        const avatarUrl = profile.photos?.[0]?.value;
        const githubId = profile.id;

        const user = await this.authService.findOrCreateGithubUser({ githubId, email, name, avatarUrl });
        done(null, user);
    }
}