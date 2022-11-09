import {ObjectId} from 'mongodb'
import {Request, Response} from 'express';
import {joiValidation} from '@global/decordators/joi-validation.decorators';
import {signupSchema} from '@auth/schemas/signup';
import {IAuthDocument, ISignUpData} from '@auth/interfaces/auth.interface';
import {authService} from '@service/db/auth.service';
import {BadRequestError} from '@global/helpers/error-handler';
import {Helpers} from '@global/helpers/helpers';
import {UploadApiResponse} from 'cloudinary';
import {uploads} from '@global/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';
import {UserCache} from "@service/redis/user.cache";
import {IUserDocument} from "@auth/interfaces/user.interface";
import {omit} from 'lodash'
import {authQueue} from "@service/queue/auth.queue";
const userCache = new UserCache()

export class SignUp {

  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const {username, email, password, avatarColor, avatorImage} = req.body
    const checkIfUserExist: IAuthDocument = await authService.getUserByUserNameOrEmail(username, email)
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials')
    }

    const authObjId: ObjectId = new ObjectId()
    const userObjId: ObjectId = new ObjectId()
    const uId = `${Helpers.generateRandomIntegers(12)}`
    const authData: IAuthDocument = SignUp.prototype.signUpData({
      _id: authObjId,
      uId,
      username,
      email,
      password,
      avatarColor
    })

    const result: UploadApiResponse = await uploads(avatorImage, `${userObjId}`, true, true) as UploadApiResponse


    if (!result?.public_id) {
      throw new BadRequestError(`File upload error.Try again.`)
    }

    //TODO 添加到Redis 缓存
    const userDataForCache :IUserDocument = SignUp.prototype.userData(authData, userObjId, result)
    userDataForCache.profilePicture = `https://res/cloudinary/dpkasn7ui/image/upload/${result.version}/${userObjId}`
    await userCache.saveUserToCache(`${userObjId}`,uId,userDataForCache)
    //TODO 添加到数据库
    omit(userDataForCache,['uId','username','email','avatarColor','password'])

    //TODO 让worker将数据存到数据库中
    authQueue.addAuthUserJob('addAuthUserToDB',{value:userDataForCache})
    res.status(HTTP_STATUS.CREATED).json({messages: 'User created successfully', authData})
  }

  private signUpData(data: ISignUpData): IAuthDocument {
    const {_id, username, email, uId, password, avatarColor} = data

    return {
      _id,
      uId,
      email: Helpers.lowerCase(email),
      username: Helpers.firstLetterUpperCase(username),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument
  }

  private userData(authData: IAuthDocument, userObjId: ObjectId, result: UploadApiResponse): IUserDocument {
    const {_id, uId, username, email, avatarColor} = authData
    return {
      _id: userObjId,
      authId: _id,
      uId,
      username:Helpers.firstLetterUpperCase(username),
      email,
      avatarColor,
      profilePicture: result?.secure_url,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      blocked: false,
      blockedBy: [],
      notifications: [],
      social: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        github: '',
        youtube: '',
        website: '',
      },
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageId: '',
      bgImageVersion: '',
      createdAt: new Date()
    } as unknown as IUserDocument
  }

}
