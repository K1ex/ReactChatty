import {ObjectId} from 'mongodb'
import {Request,Response} from 'express';
import {joiValidation} from '@global/decordators/joi-validation.decorators';
import {signupSchema} from '@auth/schemas/signup';
import {IAuthDocument, ISignUpData} from '@auth/interfaces/auth.interface';
import {authService} from '@service/db/auth.service';
import {BadRequestError} from '@global/helpers/error-handler';
import {Helpers} from '../../../shared/globals/helpers/helpers';
import {UploadApiResponse} from 'cloudinary';
import {uploads} from '../../../shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

export class SignUp {

  @joiValidation(signupSchema)
  public async create(req:Request,res:Response):Promise<void> {
    const {username, email, password, avatarColor, avatorImage} = req.body
    const checkIfUserExist: IAuthDocument = await authService.getUserByUserNameOrEmail(username, email)
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid credentials')
    }

    const authObjId: ObjectId = new ObjectId()
    const userObjId: ObjectId = new ObjectId()
    const uId = `${Helpers.generateRandomIntegers(12)}`
    const authData :IAuthDocument = SignUp.prototype.signUpData({
      _id:authObjId,
      uId,
      username,
      email,
      password,
      avatarColor
    })

    const result :UploadApiResponse = await uploads(avatorImage,`${userObjId}`,true,true) as UploadApiResponse


    if (!result?.public_id) {
      throw new BadRequestError(`File upload error.Try again.`)
    }
    res.status(HTTP_STATUS.CREATED).json({messages:'User created successfully',authData})
  }

  private signUpData(data: ISignUpData):IAuthDocument {
    const {_id,username,email,uId,password,avatarColor} = data

    return {
      _id,
      uId,
      email:Helpers.lowerCase(email),
      username:Helpers.firstLetterUpperCase(username),
      password,
      avatarColor,
      createdAt: new Date()
    } as unknown as IAuthDocument
  }

}
