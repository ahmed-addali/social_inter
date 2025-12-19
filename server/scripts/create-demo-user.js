require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose.set("strictQuery", true);

const User = require("../models/user.model");
const Community = require("../models/community.model");
const Post = require("../models/post.model");
const Comment = require("../models/comment.model");
const UserContext = require("../models/context.model");
const UserPreference = require("../models/preference.model");
const Relationship = require("../models/relationship.model");
const Rule = require("../models/rule.model");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    createDemoUser();
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error.message);
  });

async function createDemoUser() {
  try {

    // Remove any existing demo data (users, communities, posts, comments)
    const existingDemoUsers = await User.find({ email: { $regex: /^demo/i } });
    if (existingDemoUsers.length > 0) {
      console.log("Demo users found. Deleting existing demo users and related data...");
      const demoUserIds = existingDemoUsers.map((u) => u._id);
      await Post.deleteMany({ user: { $in: demoUserIds } });
      await Comment.deleteMany({ user: { $in: demoUserIds } });
      await UserContext.deleteMany({ email: { $regex: /^demo/i } });
      await UserPreference.deleteMany({ user: { $in: demoUserIds } });
      await Relationship.deleteMany({ $or: [{ follower: { $in: demoUserIds } }, { following: { $in: demoUserIds } }] });
      await User.deleteMany({ _id: { $in: demoUserIds } });
    }

    // Remove any demo-only communities
    const existingDemoComms = await Community.find({ name: { $regex: /^Demo -/i } });
    if (existingDemoComms.length > 0) {
      console.log("Deleting existing demo communities...");
      const demoCommIds = existingDemoComms.map((c) => c._id);
      await Post.deleteMany({ community: { $in: demoCommIds } });
      await Community.deleteMany({ _id: { $in: demoCommIds } });
    }

    // Create demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const demoUser = new User({
      name: "Demo User",
      email: "demo@socialecho.com",
      password: hashedPassword,
      avatar: "https://i.pravatar.cc/150?img=33",
      location: "San Francisco, CA",
      bio: "This is a demo account. Feel free to explore all features of SocialEcho!",
      interests: "Technology, Travel, Photography, Food, Sports",
      emailVerified: true,
    });

    await demoUser.save();
    console.log(`✓ Demo user created: ${demoUser.email}`);

    // Create user preferences (disable context-based auth for demo)
    const demoPreference = new UserPreference({
      user: demoUser._id,
      enableContextBasedAuth: false,
      visibility: "public",
      showEmail: false,
      showLocation: true,
    });
    await demoPreference.save();
    console.log("✓ Demo user preferences created");

    // Create user context
    const demoContext = new UserContext({
      user: demoUser._id,
      email: demoUser.email,
      ip: "127.0.0.1",
      country: "US",
      city: "San Francisco",
      browser: "Chrome 120",
      platform: "Windows",
      os: "Windows 10",
      device: "unknown",
      deviceType: "Desktop",
    });
    await demoContext.save();
    console.log("✓ Demo user context created");

    // Create dedicated demo communities (expanded to 10)
    const demoCommunitiesData = [
      { name: "Demo - Technology", description: "Explore the latest tech trends, gadgets, and innovations", category: "Technology" },
      { name: "Demo - Web Development", description: "Share and learn web development techniques, frameworks, and best practices", category: "Technology" },
      { name: "Demo - Photography", description: "Share your best shots and learn photography techniques", category: "Arts" },
      { name: "Demo - Travel", description: "Share travel experiences and discover amazing destinations", category: "Lifestyle" },
      { name: "Demo - Fitness", description: "Health, fitness, and wellness discussions", category: "Health" },
      { name: "Demo - Gaming", description: "Discuss your favorite games and gaming news", category: "Entertainment" },
      { name: "Demo - Cooking", description: "Share recipes and cooking tips", category: "Food" },
      { name: "Demo - Music", description: "Discover and discuss music from all genres", category: "Arts" },
      { name: "Demo - Books", description: "Book recommendations and literary discussions", category: "Education" },
      { name: "Demo - Science", description: "Fascinating science topics and discoveries", category: "Education" },
    ];

    const demoCommunities = [];
    for (const commData of demoCommunitiesData) {
      // Create rules for this community
      const communityRules = [];
      const ruleTexts = [
        { rule: "Be respectful to all members", description: "Treat everyone with respect and kindness" },
        { rule: "No spam or self-promotion", description: "Do not post spam or excessive self-promotional content" },
        { rule: "Stay on topic", description: "Keep posts relevant to the community theme" }
      ];
      
      for (const ruleData of ruleTexts) {
        const rule = new Rule({
          rule: ruleData.rule,
          description: ruleData.description,
        });
        await rule.save();
        communityRules.push(rule._id);
      }

      const comm = new Community({
        name: commData.name,
        description: commData.description,
        category: commData.category,
        rules: communityRules,
        members: [],
        membersCount: 0,
      });
      await comm.save();
      demoCommunities.push(comm);
      console.log(`✓ Created demo community: ${comm.name}`);
    }

    // Create some fake users to populate demo content (expanded to 15)
    const fakeUsers = [];
    const fakeUserCount = 15;
    const fakeUserNames = [
      "Alex Johnson", "Sarah Chen", "Michael Brown", "Emma Davis", "James Wilson",
      "Olivia Martinez", "David Lee", "Sophia Taylor", "Daniel Anderson", "Ava Thomas",
      "Ryan Garcia", "Isabella Rodriguez", "Nathan White", "Mia Harris", "Chris Martin"
    ];
    const fakeBios = [
      "Tech enthusiast and coffee lover ☕",
      "Photographer capturing life's moments 📸",
      "Full-stack developer building amazing things 💻",
      "Travel blogger exploring the world 🌍",
      "Fitness coach helping you reach your goals 💪",
      "Gamer and content creator 🎮",
      "Foodie sharing delicious recipes 🍕",
      "Music producer and DJ 🎵",
      "Book lover and writer 📚",
      "Science nerd and space enthusiast 🚀",
      "Digital artist and designer 🎨",
      "Marathon runner and outdoor adventurer 🏃",
      "Tech reviewer and gadget geek 📱",
      "Yoga instructor and wellness advocate 🧘",
      "Entrepreneur building the future 🚀"
    ];

    for (let i = 1; i <= fakeUserCount; i++) {
      const email = `demo_user${i}@socialecho.com`;
      const user = new User({
        name: fakeUserNames[i - 1] || `Demo User ${i}`,
        email,
        password: hashedPassword,
        avatar: `https://i.pravatar.cc/150?img=${20 + i}`,
        bio: fakeBios[i - 1] || "Demo user for preview",
        location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Austin, TX", "Seattle, WA", "Boston, MA", "San Diego, CA", "Denver, CO", "Portland, OR", "Miami, FL"][i % 10],
        interests: ["Technology", "Travel", "Photography", "Fitness", "Gaming", "Cooking", "Music", "Books", "Science", "Art"].slice(0, Math.floor(Math.random() * 5) + 2).join(", "),
        emailVerified: true,
      });
      await user.save();
      fakeUsers.push(user);
      console.log(`✓ Created fake user: ${user.name} (${user.email})`);
    }

    // Create sample posts for the demo environment (authored by demo or fake users)
    const postTexts = [
      // Technology posts
      { text: "Just finished building my first React Native app! The cross-platform capabilities are amazing. Anyone else working with React Native?", community: 0 },
      { text: "AI is changing everything we do. What's your take on ChatGPT and similar tools? Are they helping or hurting productivity?", community: 0 },
      { text: "Finally upgraded to the latest MacBook Pro with M3 chip. The performance is incredible! Worth every penny. 💻", community: 0 },
      
      // Web Development posts
      { text: "Working on a new project using Next.js 14. The app router is a game changer! Any tips for optimizing performance?", community: 1 },
      { text: "CSS Grid vs Flexbox - which one do you prefer and why? I find myself using Grid more often these days.", community: 1 },
      { text: "Just deployed my portfolio site using Vercel. The deployment process was incredibly smooth! Check it out and let me know what you think.", community: 1 },
      
      // Photography posts
      { text: "Golden hour at the beach today 🌅 Sometimes the best shots are the spontaneous ones. What's your favorite time to shoot?", community: 2 },
      { text: "Invested in a new 85mm f/1.4 lens and wow! The bokeh is absolutely stunning. Portrait photographers, what's your go-to lens?", community: 2 },
      { text: "Street photography tips: Always keep your camera ready. You never know when the perfect moment will happen!", community: 2 },
      
      // Travel posts
      { text: "Just got back from Japan 🇯🇵 The food, culture, and people were absolutely amazing! Tokyo is now my favorite city.", community: 3 },
      { text: "Planning a trip to Iceland next month. Any recommendations for must-see locations? Also, best time for Northern Lights?", community: 3 },
      { text: "Traveling solo for the first time and loving it! The freedom to explore at your own pace is incredible. 🌍", community: 3 },
      
      // Fitness posts
      { text: "Hit a new personal record on deadlifts today! 💪 Hard work pays off. What's everyone working on this week?", community: 4 },
      { text: "Morning runs are the best way to start the day. The city is so peaceful at sunrise. Who else is an early morning runner?", community: 4 },
      { text: "Meal prep Sunday! Prepared healthy meals for the entire week. Consistency is key to reaching your fitness goals.", community: 4 },
      
      // Gaming posts
      { text: "Finally beat Elden Ring after 120 hours! What an incredible experience. Already planning my second playthrough. 🎮", community: 5 },
      { text: "The new Zelda game is absolutely stunning! Nintendo really outdid themselves this time. Anyone else playing?", community: 5 },
      { text: "Started streaming on Twitch last week. Building a community from scratch is challenging but so rewarding!", community: 5 },
      
      // Cooking posts
      { text: "Made homemade pasta from scratch for the first time. It's easier than I thought! Recipe in comments. 🍝", community: 6 },
      { text: "Sunday brunch vibes ☕🥞 Whipped up some fluffy pancakes with fresh berries. What's your favorite brunch dish?", community: 6 },
      { text: "Experimenting with Thai cuisine tonight. Tom Yum soup is on the menu! Any tips for getting the flavors just right?", community: 6 },
      
      // Music posts
      { text: "Just discovered this indie band and I'm obsessed! Their sound is so unique. Drop your favorite lesser-known artists below. 🎵", community: 7 },
      { text: "Vinyl collection update! Just added 5 new records to my collection. There's something special about analog sound.", community: 7 },
      { text: "Working on a new track in my home studio. The creative process is both frustrating and rewarding. Producers, what's your workflow?", community: 7 },
      
      // Books posts
      { text: "Just finished reading 'Project Hail Mary' and wow! What a ride. Sci-fi fans, you need to read this! 📚", community: 8 },
      { text: "Looking for book recommendations in the fantasy genre. Already read all of Sanderson's work. What should I read next?", community: 8 },
      { text: "Started a book club with friends. Our first pick is '1984' by Orwell. Classic literature never gets old!", community: 8 },
      
      // Science posts
      { text: "The James Webb Space Telescope images never cease to amaze me. We're living in an incredible time for space exploration! 🔭", community: 9 },
      { text: "Quantum computing is about to change everything. The potential applications are mind-blowing. Who else is following this field?", community: 9 },
      { text: "Just watched a documentary on CRISPR gene editing. The ethical implications are fascinating and concerning at the same time.", community: 9 },
    ];

    const createdPosts = [];
    for (let i = 0; i < postTexts.length; i++) {
      const postData = postTexts[i];
      const community = demoCommunities[postData.community % demoCommunities.length];

      // pick an author: either demoUser or a random fake user
      const authors = [demoUser, ...fakeUsers];
      const author = authors[Math.floor(Math.random() * authors.length)];

      const post = new Post({
        user: author._id,
        community: community._id,
        content: postData.text,
        likes: [],
        comments: [],
      });

      await post.save();
      createdPosts.push(post);
      console.log(`✓ Created post ${i + 1}: "${postData.text.substring(0, 50)}..." (author: ${author.name})`);
    }

    // Create sample comments on the posts
    const commentTexts = [
      "Great post! Thanks for sharing your thoughts.",
      "I totally agree with this perspective!",
      "This is really helpful, thank you!",
      "Interesting point of view. I'd like to know more.",
      "Thanks for the recommendation!",
      "Amazing content! Keep it up.",
      "This resonates with me so much!",
      "I had a similar experience recently.",
      "Could you elaborate more on this?",
      "Definitely going to try this out!",
      "Best post I've read today!",
      "This is exactly what I needed to hear.",
      "Mind blown! 🤯",
      "Couldn't have said it better myself.",
      "Bookmarking this for later!",
      "Super insightful, thanks!",
      "Love this perspective!",
      "Can't wait to see more content like this.",
      "This changed my view on the topic.",
      "Brilliant explanation!",
    ];

    // Add comments from fake users to posts (more varied)
    let totalComments = 0;
    for (let i = 0; i < createdPosts.length; i++) {
      const post = createdPosts[i];
      const commentsToAdd = Math.floor(Math.random() * 5) + 1; // 1-5 comments per post
      for (let j = 0; j < commentsToAdd; j++) {
        const commenter = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const comment = new Comment({
          user: commenter._id,
          post: post._id,
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        });
        await comment.save();
        post.comments.push(comment._id);
        totalComments++;
      }
      await post.save();
    }
    console.log(`✓ Added ${totalComments} comments across all posts`);

    // Add random likes to posts (from fake users and demo user)
    let totalLikes = 0;
    for (const post of createdPosts) {
      const likesCount = Math.floor(Math.random() * 12) + 3; // 3-15 likes per post
      const allUsers = [demoUser, ...fakeUsers];
      const shuffled = allUsers.sort(() => 0.5 - Math.random());
      const likers = shuffled.slice(0, Math.min(likesCount, allUsers.length));
      
      for (const liker of likers) {
        if (!post.likes.includes(liker._id)) {
          post.likes.push(liker._id);
          totalLikes++;
        }
      }
      await post.save();
    }
    console.log(`✓ Added ${totalLikes} likes across all posts`);

    // Add demo user and fake users to demo communities
    for (const community of demoCommunities) {
      const members = [demoUser._id, ...fakeUsers.map((u) => u._id)];
      community.members = Array.from(new Set([...(community.members || []), ...members]));
      community.membersCount = community.members.length;
      await community.save();
      console.log(`✓ Populated community: ${community.name} with demo users`);
    }


    // Create follower relationships between demo user and fake users
    for (const user of fakeUsers) {
      // demo follows fake user
      const rel1 = new Relationship({ follower: demoUser._id, following: user._id });
      await rel1.save();
      // fake user follows demo
      const rel2 = new Relationship({ follower: user._id, following: demoUser._id });
      await rel2.save();
      // update followers/following arrays on users
      if (!demoUser.following.includes(user._id)) demoUser.following.push(user._id);
      if (!user.followers.includes(demoUser._id)) user.followers.push(demoUser._id);
      await user.save();
    }
    console.log(`✓ Created ${fakeUsers.length * 2} follow relationships (demo <-> fake users)`);

    // Create some random follow relationships between fake users
    let randomFollows = 0;
    for (let i = 0; i < fakeUsers.length; i++) {
      const follower = fakeUsers[i];
      const followCount = Math.floor(Math.random() * 5) + 2; // Each fake user follows 2-6 others
      const shuffled = fakeUsers.filter(u => u._id.toString() !== follower._id.toString()).sort(() => 0.5 - Math.random());
      const toFollow = shuffled.slice(0, Math.min(followCount, shuffled.length));
      
      for (const following of toFollow) {
        const rel = new Relationship({ follower: follower._id, following: following._id });
        await rel.save();
        if (!follower.following.includes(following._id)) follower.following.push(following._id);
        if (!following.followers.includes(follower._id)) following.followers.push(follower._id);
        await following.save();
        randomFollows++;
      }
      await follower.save();
    }
    console.log(`✓ Created ${randomFollows} follow relationships between fake users`);

    await demoUser.save();

    console.log("\n✅ Demo user setup completed successfully!");
    console.log("\n📧 Email: demo@socialecho.com");
    console.log("🔑 Password: demo123");
    console.log("\nYou can now use these credentials to sign in as a demo user.\n");
  } catch (error) {
    console.error("❌ Error creating demo user:", error.message);
  } finally {
    mongoose.connection.close();
  }
}

async function createSampleCommunities() {
  const sampleCommunities = [
    {
      name: "Technology",
      description: "Discuss the latest in technology, gadgets, and innovations",
      category: "Technology",
      rules: [
        "Be respectful to all members",
        "No spam or self-promotion",
        "Stay on topic",
      ],
    },
    {
      name: "Photography",
      description: "Share and discuss photography techniques, gear, and your best shots",
      category: "Arts",
      rules: [
        "Only post original content",
        "Credit other photographers",
        "Constructive criticism only",
      ],
    },
    {
      name: "Web Development",
      description: "A community for web developers to share knowledge and projects",
      category: "Technology",
      rules: [
        "Share quality content",
        "Help fellow developers",
        "No pirated content",
      ],
    },
    {
      name: "Travel",
      description: "Share your travel experiences and discover new destinations",
      category: "Lifestyle",
      rules: [
        "Be respectful of cultures",
        "Share helpful tips",
        "No promotional content",
      ],
    },
    {
      name: "Fitness",
      description: "Achieve your fitness goals together with this supportive community",
      category: "Health",
      rules: [
        "No harmful advice",
        "Support each other",
        "Respect all fitness levels",
      ],
    },
  ];

  for (const communityData of sampleCommunities) {
    const existing = await Community.findOne({ name: communityData.name });
    if (!existing) {
      const community = new Community({
        name: communityData.name,
        description: communityData.description,
        category: communityData.category,
        rules: communityData.rules,
        members: [],
        membersCount: 0,
      });
      await community.save();
      console.log(`✓ Created sample community: ${community.name}`);
    }
  }
}
