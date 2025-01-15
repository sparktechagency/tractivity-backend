import { ObjectId, Types } from 'mongoose';
import IUser from './user.interface';
import User from './user.model';

// service for create new user
const createUser = async (data: IUser) => {
  return await User.create(data);
};

// service for get specific user
const getSpecificUser = async (id: string): Promise<IUser> => {
  return await User.findOne({ _id: id }).select('-password');
};

// service for get all user
const getAllUser = async (searchQuery: string, role: string, skip: number, limit: number): Promise<IUser[]> => {
  const query: any = {};
  if (searchQuery) {
    query.$text = { $search: searchQuery };
  }
  if (role) {
    query.roles = {$in: [role]};
  }

  return await User.find(query).sort('-createdAt').skip(skip).limit(limit).select('-password -verification');
};

// service for get specific user
const getSpecificUserByEmail = async (email: string): Promise<IUser> => {
  return await User.findOne({ email }).select('-password');
};

// service for update specific user
const updateSpecificUser = async (id: string, data: Partial<IUser>) => {
  return await User.updateOne({ _id: id }, data, {
    runValidators: true,
  });
};

// service for delete specific user
const deleteSpecificUser = async (id: string) => {
  return await User.deleteOne({ _id: id });
};

// service for search volunteers
const searchVolunteers = async (query: string) => {
  return await User.find({
    $text: { $search: query },
    roles: { $in: ['volunteer'] },
  }).select('image fullName profession');
};

// service for get recent user
const getRecentUsers = async () => {
  return await User.find().sort('-createdAt').limit(6).select('-password -verification')
}

export default {
  createUser,
  getSpecificUser,
  getSpecificUserByEmail,
  updateSpecificUser,
  deleteSpecificUser,
  getAllUser,
  searchVolunteers,
  getRecentUsers,
};
