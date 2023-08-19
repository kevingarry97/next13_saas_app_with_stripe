import NextAuth, { AuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import Users from "@/models/user";
import DiscordProvider from "next-auth/providers/discord";
import { connectToDB } from "@/lib/database";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },
    async session({ session }) {
      const sessionUser = await Users.findOne({ email: session?.user?.email });

      const newSession = {
        ...session,
        user: {
          ...session.user,
          id: sessionUser._id.toString(),
        },
      };

      return newSession;
    },
    async signIn({ user }: { user: User | AdapterUser }) {
      try {
        await connectToDB();

        // check if user already exists
        const userExists = await Users.findOne({ email: user?.email });

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          await Users.create({
            email: user?.email,
            username: user?.name?.replace(" ", "").toLowerCase(),
            image: user?.image,
          });
        }

        return true;
      } catch (error) {
        console.log("Error checking if user exists: ", error);
        return false;
      }
    },
  },
} as AuthOptions;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
