import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {CHECK_IMAGE_COPYRIGHT, GET_IMAGE} from './APIUtils';
import {CopyrightCheckerResponse, reportActionEnum} from '../type';

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
  let results: CopyrightCheckerResponse[] = [];

  for (const url of imageUrls) {
  
    if (url) {
      const response = await axios.post(CHECK_IMAGE_COPYRIGHT, {
        image_url: url.includes(`${GET_IMAGE}`)? url: `${GET_IMAGE}/${url}`,
      });

      console.log("image_url", url.includes(`${GET_IMAGE}`)? url: `${GET_IMAGE}/${url}`)
      console.log("Response", response.data.data);

      if (response.data.data) {
        
        const res: CopyrightCheckerResponse = response.data.data;
        res.image_url = url;

        results.push(res);
      }
    }
  }
  return results;
};

export function msToTime(ms: number): string {
  let totalSeconds = Math.floor(ms / 1000);
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
