import { JoiRequestValidationError } from '@global/helpers/error-handler';
import {NextFunction, Request} from 'express';
import { ObjectSchema } from 'joi';
import {Runtime} from 'inspector';

type IJoiDecorator = (target:any,key:string,descriptor:PropertyDescriptor) => void

export function joiValidation(schema: ObjectSchema):IJoiDecorator {
  // 下划线表示没有使用到的入参
  return (_target:any,_key:string,descriptor:PropertyDescriptor) => {
    const originalMethod = descriptor.value

    // 如果使用ValidationAsync 需要在try.catch 中调用
    descriptor.value = async function (...args:any[]) {
      const req:Request = args[0]
      const {error} = await Promise.resolve(schema.validate(req.body))
      // const res:Response = args[1]

      if (error?.details) {
        //这个message是在schema中设置的不符合规则时的提示信息
        throw new JoiRequestValidationError(error.details[0].message)
      }
      return originalMethod.apply(this,args)
    }
    return descriptor
  }
}

function signUp(req:Request,res:Response,next:NextFunction) {

}

