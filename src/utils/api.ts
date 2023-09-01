
import { APIData } from '../types'


export const errResphonse = (result: number, message: string): APIData => {

  let timestamp = Date.now();

  return {
    result:result,
    message:message,
    timestamp:timestamp,
    data:""
  }

}

export const okResphonse = (data: any): APIData => {

  let timestamp = Date.now();

  return {
    result:0,
    message:"",
    timestamp:timestamp,
    data:data
  }

}


export const outputLog = (result: number, message: string) => {

  //console.log(sd);
  //let strTimeStamp = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')

  var date = new Date();
  var dt = date.getFullYear() + "-"
      + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-"
      + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + " "
      + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ":"
      + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ":"
      + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());


  console.log(dt + " result:" + result + " message:" + message + "");


}

