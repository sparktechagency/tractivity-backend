import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import User from '../userModule/user.model';
import Event from '../eventModule/event.model';
import Organization from '../organizationModule/organization.model';
import Mission from '../missionModule/mission.model';
import { Request, Response } from 'express';

const retrieveDashboardMatrix = async (req: Request, res: Response) => {
  try {
    // Total counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalOrganizations = await Organization.countDocuments();
    const totalMissions = await Mission.countDocuments();

    // Initialize data structures for monthly stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const userStats = Array(12).fill(0);
    const eventStats = Array(12).fill(0);
    const organizationStats = Array(12).fill(0);
    const missionStats = Array(12).fill(0);

    // Fetch monthly data for users
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);
    usersByMonth.forEach(({ _id, count }) => {
      userStats[_id - 1] = count;
    });

    // Fetch monthly data for events
    const eventsByMonth = await Event.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);
    eventsByMonth.forEach(({ _id, count }) => {
      eventStats[_id - 1] = count;
    });

    // Fetch monthly data for organizations
    const organizationsByMonth = await Organization.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);
    organizationsByMonth.forEach(({ _id, count }) => {
      organizationStats[_id - 1] = count;
    });

    // Fetch monthly data for missions
    const missionsByMonth = await Mission.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
    ]);
    missionsByMonth.forEach(({ _id, count }) => {
      missionStats[_id - 1] = count;
    });

    // Normalize data for chart representation
    const maxUsers = Math.max(...userStats) || 1;
    const maxEvents = Math.max(...eventStats) || 1;
    const maxOrganizations = Math.max(...organizationStats) || 1;
    const maxMissions = Math.max(...missionStats) || 1;

    const chartData = {
      months,
      userStatistics: userStats.map((value) => (value / maxUsers) * 100),
      eventStatistics: eventStats.map((value) => (value / maxEvents) * 100),
      organizationStatistics: organizationStats.map((value) => (value / maxOrganizations) * 100),
      missionStatistics: missionStats.map((value) => (value / maxMissions) * 100),
    };

    // Response data
    const responseData = {
      totalUsers,
      totalEvents,
      totalOrganizations,
      totalMissions,
      chartData,
    };

    // Send response
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Dashboard metrics retrieved successfully!',
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: 'error',
      message: 'Failed to retrieve dashboard metrics.',
      data: null,
    });
  }
};

export default {
  retrieveDashboardMatrix,
};
