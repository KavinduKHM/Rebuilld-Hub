require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;




// // Log registered routes (for debugging)
// setTimeout(() => {
//   const routes = [];
//   try {
//     if (!app._router || !Array.isArray(app._router.stack)) throw new Error('No router stack');
//     app._router.stack.forEach((middleware) => {
//       if (middleware.route) {
//         const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
//         routes.push(`${methods} ${middleware.route.path}`);
//       } else if (middleware.name === 'router' && middleware.handle && Array.isArray(middleware.handle.stack)) {
//         middleware.handle.stack.forEach((handler) => {
//           if (handler.route) {
//             const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
//             // handler.route.path may be the sub-route; prefixing with middleware.regexp is complex — show as-is
//             routes.push(`${methods} ${handler.route.path}`);
//           }
//         });
//       }
//     });
//   } catch (e) {
//     routes.push('Could not enumerate routes: ' + e.message);
//   }
//   console.log('Registered routes:\n', routes.join('\n'));
// }, 500);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

