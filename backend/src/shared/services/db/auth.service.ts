import {IAuthDocument} from '@auth/interfaces/auth.interface';
import {Helpers} from '@global/helpers/helpers';
import {AuthModel} from '@auth/models/auth.schema';

class AuthService {
  // TODO 调用service层create将数据存入数据库
  public async createAuthUser(data:IAuthDocument):Promise<void> {
    await AuthModel.create(data)
  }

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
