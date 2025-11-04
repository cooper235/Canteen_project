import mongoose from "mongoose"

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables")
    }
    
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 45000, // Increased socket timeout
      connectTimeoutMS: 30000, // Connection timeout
      retryWrites: true,
      maxPoolSize: 10,
      heartbeatFrequencyMS: 2000
    })
    
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, attempting to reconnect...')
      setTimeout(() => {
        mongoose.connect(mongoUri).catch(err => {
          console.error('Reconnection failed:', err)
        })
      }, 5000)
    })
    
    return conn
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`)
    throw error // Let the application handle the error
  }
}

export default connectDatabase
