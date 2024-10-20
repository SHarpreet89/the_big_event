const { Schema, model } = require("mongoose");
const userSchema = require("./User"); // Assuming you are using it for reference
// You may not need to include clientSchema if not used

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    startDate: {
      type: String,
    },
    endDate: {
      type: String,
    },
    planner: {
      type: userSchema,
      required: true,
    },
    // If you plan to use Client, you should update accordingly.
    // clients: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Client",
    //   },
    // ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

const Event = model("Event", eventSchema);
module.exports = Event;
