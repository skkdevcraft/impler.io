import { AuthProviderEnum } from '@impler/shared';
import { Exclude } from 'class-transformer';

export interface IUserToken {
  providerId: string;
  provider: AuthProviderEnum;
  accessToken: string;
}

export class UserEntity {
  _id: string;

  firstName?: string | null;

  lastName?: string | null;

  email?: string | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  profilePicture?: string | null;

  @Exclude({ toPlainOnly: true })
  tokens: IUserToken[];

  showOnBoarding?: boolean;

  @Exclude({ toPlainOnly: true })
  resetToken?: string;

  @Exclude({ toPlainOnly: true })
  resetTokenDate?: string;
}
