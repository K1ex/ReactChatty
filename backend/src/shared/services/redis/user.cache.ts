import {BaseCache} from "@service/redis/base.cache";
import {IUserDocument} from "@auth/interfaces/user.interface";
import {config} from "@root/config";
import Logger from "bunyan";

const log: Logger = config.createLogger('userCache')

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createAt = new Date()
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser
    const firstList: string[] = [
      '_id', `${_id}`,
      'uId', `${userUId}`,
      'username', `${username}`,
      'email', `${email}`,
      'avatarColor', `${avatarColor}`,
      'blocked', `${blocked}`,
      'blockedBy', `${blockedBy}`,
      'postsCount', `${postsCount}`,
    ]

    const secondList: string[] = [
      'bloacked', JSON.stringify(blocked),
      'blockedBy', JSON.stringify(blockedBy),
      'profilePicture', `${profilePicture}`,
      'followingCount', `${followingCount}`,
      'followersCount', `${followersCount}`,
      'notifications', JSON.stringify(notifications),
      'social', JSON.stringify(social),
    ]

    const thirdList: string[] = [
      'work', `${work}`,
      'location', `${location}`,
      'school', `${school}`,
      'quote', `${quote}`,
      'bgImageVersion', `${bgImageVersion}`,
      'bgImageId', `${bgImageId}`,
    ]

    const dataToSave = [...firstList, ...secondList, ...thirdList]

    try {
      if (!this.client.isOpen) {
        await this.client.connect()
      }
      await this.client.ZADD('users', {score: parseInt(userUId, 10), value: `${key}`})
      await this.client.HSET(`users:${key}`,dataToSave)
    } catch (error) {
      log.error(error)
    }
  }
}
