import { ObjectId } from "mongodb";
import { getTenantCollections } from "../../config/db.js";

export const addHoliday = async (companyId, hrId, holidaydata) => {
  try {
    if (!companyId || !holidaydata) {
      return {
        done: false,
        message: "All fields are required",
      };
    }

    const collections = getTenantCollections(companyId);

    if (
      !holidaydata.title ||
      !holidaydata.date ||
      !holidaydata.description ||
      !holidaydata.status
    ) {
      return {
        done: false,
        message: "Holiday title, date, description and status are required",
      };
    }

    if (new Date(holidaydata.date) < new Date()) {
      return { done: false, message: "Date must be in the future" };
    }

    const existingHoliday = await collections.holidays.findOne({
      date: new Date(holidaydata.date),
    });

    if (existingHoliday) {
      console.log("swetyy");
      
      return {
        done: false,
        message: "A holiday already exists on this date",
      };
    }

    const result = await collections.holidays.insertOne({
      title: holidaydata.title,
      date: new Date(holidaydata.date),
      description: holidaydata.description,
      status: holidaydata.status,
      createdBy: hrId,
      createdAt: new Date(),
    });

    return {
      done: true,
      data: {
        _id: result.insertedId,
        ...holidaydata,
      },
      message: "Holiday created successfully",
    };
  } catch (error) {
    return {
      done: false,
      message: `Failed to create holiday: ${error.message}`,
    };
  }
};

export const displayHoliday = async (companyId) => {
  try {
    if (!companyId) {
      return { done: false, message: "Missing companyId" };
    }

    const collections = getTenantCollections(companyId);

    const holidays = await collections.holidays
      .find({})
      .sort({ date: -1 })
      .toArray();

    return {
      done: true,
      data: holidays,
      message: holidays.length
        ? "holidays fetched successfully"
        : "No holidays found matching criteria",
    };
  } catch (error) {
    return {
      done: false,
      message: `Failed to fetch holidays: ${error.message}`,
    };
  }
};
