export class Helpers {
  static firstLetterUpperCase(str:string):string {
    const valueString = str.toLowerCase();
    const firstLetter = valueString.charAt(0).toUpperCase()
    return firstLetter + valueString.substring(1)
  }

  static lowerCase(str:string):string {
    return str.toLowerCase()
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt(result, 10);
  }
}
