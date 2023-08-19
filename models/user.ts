import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required"],
  },
  username: {
    type: String,
    required: [true, "Username is required!"],
  },
  image: {
    type: String,
  },
  stripe_customer_id: {
    type: String || null,
  },
  stripe_subscription_item: {
    type: String || null,
  },
  api_key: {
    type: String || null,
  },
});

const Users = models.Users || model("Users", userSchema);

export default Users;
