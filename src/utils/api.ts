
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