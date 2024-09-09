import {
  updateProfile,
  updateProfileByCustomerId
} from "@/db/queries/profiles-queries"
import { Membership } from "@/types/membership"
import Stripe from "stripe"
import { stripe } from "./stripe"

// ... (rest of the code as provided)