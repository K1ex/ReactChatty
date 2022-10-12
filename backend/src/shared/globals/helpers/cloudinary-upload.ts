import cloudinary, {UploadApiErrorResponse, UploadApiResponse} from 'cloudinary';

export function uplods(
  file: string, //base64
  public_id?: string,
  override?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      {
        public_id,
        override,
        invalidate
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          resolve(error)
        }
        resolve(result)
      }
    );
  });
}
