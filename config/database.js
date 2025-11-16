import mongoose from "mongoose"

export const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables")
    }
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      maxPoolSize: 10,
      heartbeatFrequencyMS: 2000,
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    })
    
    console.log(`MongoDB Connected: ${conn.connection.host}`)
    
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err)
    })
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected')
    })
    
    return conn
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`)
    throw error // Let the application handle the error
  }
}

export default connectDatabase
