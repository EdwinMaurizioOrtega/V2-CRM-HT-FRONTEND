import { sub } from 'date-fns';
//
import {
  age,
  role,
  price,
  title,
  email,
  rating,
  percent,
  country,
  company,
  boolean,
  sentence,
  lastName,
  fullName,
  firstName,
  description,
  fullAddress,
  phoneNumber,
} from './assets';

// ----------------------------------------------------------------------

const _mock = {
  id: (index) => `e99f09a7-dd88-49d5-b1c8-1daf80c2d7b${index + 1}`,
  email: (index) => email[index],
  phoneNumber: (index) => phoneNumber[index],
  time: (index) => sub(new Date(), { days: index, hours: index }),
  boolean: (index) => boolean[index],
  role: (index) => role[index],
  company: (index) => company[index],
  address: {
    fullAddress: (index) => fullAddress[index],
    country: (index) => country[index],
  },
  name: {
    firstName: (index) => firstName[index],
    lastName: (index) => lastName[index],
    fullName: (index) => fullName[index],
  },
  text: {
    title: (index) => title[index],
    sentence: (index) => sentence[index],
    description: (index) => description[index],
  },
  number: {
    percent: (index) => percent[index],
    rating: (index) => rating[index],
    age: (index) => age[index],
    price: (index) => price[index],
  },
  image: {
    cover: (index) =>
      `https://novicompu.vtexassets.com/assets/vtex.file-manager-graphql/images/d86912b5-c2e3-46d6-9b29-234dfa7270fc___8d31091d51693157751b1a1ca55a4ad5.png`,
    product: (index) =>
      `https://novicompu.vtexassets.com/assets/vtex.file-manager-graphql/images/d86912b5-c2e3-46d6-9b29-234dfa7270fc___8d31091d51693157751b1a1ca55a4ad5.png`,
    avatar: (index) =>
      `https://novicompu.vtexassets.com/assets/vtex.file-manager-graphql/images/d86912b5-c2e3-46d6-9b29-234dfa7270fc___8d31091d51693157751b1a1ca55a4ad5.png`,
  },
};

export default _mock;
