import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {CHECK_IMAGE_COPYRIGHT, GET_IMAGE} from './APIUtils';
import {CopyrightCheckerResponse} from '../type';

// Async Storage for get Item
export const retrieveItem = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
    console.log('Error reading value', e);
  }
};

// Async Storage Store Item
export const storeItem = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
    // console.log(`Value saved for key : ${key}`, value);
  } catch (e) {
    console.log('Async Storage Data error', e);
  }
};

// Async storage remove item

export const removeItem = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    //navigation.navigate('LoginScreen');
  } catch (error) {
    console.error('Error removing item:', error);
  }
};

export const KEYS = {
  USER_ID: 'USER_ID',
  USER_TOKEN: 'USER_TOKEN',
  USER_TOKEN_EXPIRY_DATE: 'USER_TOKEN_EXPIRY_DATE',
  VULTR_CHAT_MODEL: 'zephyr-7b-beta-f32',
  VULTR_COLLECTION: 'care_companion',
  USER_HANDLE: 'USER_HANDLE',
  IS_SUPER_ADMIN: 'IS_SUPER_ADMIN',
};
export const StatusEnum = {
  UNASSIGNED: 'unassigned', // can't change
  IN_PROGRESS: 'in-progress', // can't change
  REVIEW_PENDING: 'review-pending', // can't change
  PUBLISHED: 'published',
  DISCARDED: 'discarded', // can't change
  AWAITING_USER: 'awaiting-user',
};

export function formatCount(count: number) {
  if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return Math.floor(count / 1000) + 'k';
  } else {
    return Math.floor(count / 1000000) + 'M';
  }
}

export const createFeebackHTMLStructure = (feedback: string) => {
  return `<!DOCTYPE html>
   <html>
   <head>
   <style>
   /**
    * Copyright 2024,UltimateHealth. All rights reserved.
    */
   body {
     font-family: Arial, sans-serif;
     font-size: 40px; 
     line-height: 1.5; 
     color: #333; 
   }
   
   h1 {
     color: #00698f;
   }
   
   h2 {
     color: #008000;
   }
   
   h3 {
     color: #660066;
   }
   
   h4 {
     color: #0099CC;
   }
   
   h5 {
     color: #FF9900;
   }
   
   h6 {
     color: #663300;
   }
   
   ul {
     list-style-type: disc;
   }
   
   li {
     margin-bottom: 10px;
   }
   
   article {
     width: 80%;
     margin: 40px auto;
   }
   table {
       border-collapse: collapse;
       width: 100%;
     }
   
     th, td {
       border: 1px solid #ddd;
       padding: 8px;
       text-align: left;
     }
   
     th {
       background-color: #f0f0f0;
     }
   .tag-list {
     list-style-type: none;
     padding: 0;
     margin: 0;
     display: flex;
     flex-wrap: wrap;
   }
   
   .tag-list li {
     margin-right: 10px;
   }
   
   .tag {
     color: blue;
     text-decoration: none;
   }
   </style>
   </head>
   <body>
   ${feedback}
   <hr>
   </body>
   `;
};

export const checkImageCopyright = async (imageUrls: string[]) => {
  const validUrls = imageUrls.filter(Boolean);
  const promises = validUrls.map(async url => {
    try {
      const imageUrl = url.includes(GET_IMAGE) ? url : `${GET_IMAGE}/${url}`;
      const response = await axios.post(CHECK_IMAGE_COPYRIGHT, {
        image_url: imageUrl,
      });

      if (response.data?.data) {
        const res: CopyrightCheckerResponse = response.data.data;
        res.image_url = url;
        return res;
      }
      return null;
    } catch (err) {
      console.log('Error checking image copyright for:', url, err);
      return null;
    }
  });

  const settled = await Promise.allSettled(promises);
  return settled
    .filter(
      (s): s is PromiseFulfilledResult<CopyrightCheckerResponse> =>
        s.status === 'fulfilled' && s.value !== null,
    )
    .map(s => s.value);
};

export function msToTime(ms: number): string {
  let totalSeconds = Math.floor(ms);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number): string => num.toString().padStart(2, '0');

  let result =
    hours >= 1
      ? `${pad(hours)}h:${pad(minutes)}m`
      : `${pad(minutes)}m:${pad(seconds)}s`;
  
  return result;
}


export const getApiErrorMessage = (
  error: any,
  defaultMessage: string = 'Something went wrong. Please try again.',
): string => {
  if (!error) return defaultMessage;

  if (typeof error === 'string') return error;

  const data = error.response?.data;
  if (data !== undefined && data !== null) {
    if (typeof data === 'string' && data.trim().length > 0) return data;

    if (data.message !== undefined && data.message !== null) {
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message;
      }
      if (typeof data.message === 'object') {
        if (typeof data.message.message === 'string' && data.message.message.trim().length > 0) {
          return data.message.message;
        }
        if (typeof data.message.error === 'string' && data.message.error.trim().length > 0) {
          return data.message.error;
        }
      }
    }

    if (data.error !== undefined && data.error !== null) {
      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        return data.error;
      }
      if (typeof data.error === 'object') {
        if (typeof data.error.message === 'string' && data.error.message.trim().length > 0) {
          return data.error.message;
        }
        if (typeof data.error.error === 'string' && data.error.error.trim().length > 0) {
          return data.error.error;
        }
      }
    }

    if (typeof data.detail === 'string' && data.detail.trim().length > 0) {
      return data.detail;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const first = data.errors[0];
      if (typeof first === 'string') return first;
      if (first && typeof first.msg === 'string') return first.msg;
      if (first && typeof first.message === 'string') return first.message;
    }
  }

  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    return error.message;
  }

  return defaultMessage;
};
