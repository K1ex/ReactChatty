import {IAuthDocument} from '@auth/interfaces/auth.interface';
import {Helpers} from '@global/helpers/helpers';
import {AuthModel} from '@auth/models/auth.schema';

class AuthService {
  public async getUserByUserNameOrEmail(username:string,email:string):Promise<IAuthDocument> {
    // 会尝试从Redis中获取数据
    const query = {
      $or:[{ username: Helpers.firstLetterUpperCase(username)},{email:Helpers.lowerCase(email)}]
    }
    const user:IAuthDocument = await AuthModel.findOne(query).exec() as IAuthDocument
    return user
  }
}

export const authService: AuthService = new AuthService()
