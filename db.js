const mongoose = require("mongoose");

const localDB = `mongodb://localhost:27017/role_auth`;

const connectDB = async () => {
  try {
    await mongoose.connect(localDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Check if the database already exists
    const adminDB = mongoose.connection.db.admin();
    const databases = await adminDB.listDatabases();
    const databaseNames = databases.databases.map(db => db.name);
    if (!databaseNames.includes('role_auth')) {
      // Creating a document in a collection to ensure the database creation
      const RoleAuthModel = mongoose.model('RoleAuth', new mongoose.Schema({}));
      await RoleAuthModel.create({});
      console.log('role_auth database created');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
};

module.exports = connectDB;
