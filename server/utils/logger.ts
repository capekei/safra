export class Logger {
  private static isProduction = process.env.NODE_ENV === 'production';
  
  static info(message: string, ...args: any[]) {
    console.log(`ℹ️  ${message}`, ...args);
  }
  
  static warn(message: string, ...args: any[]) {
    console.warn(`⚠️  ${message}`, ...args);
  }
  
  static error(message: string, ...args: any[]) {
    console.error(`❌ ${message}`, ...args);
  }
  
  static debug(message: string, ...args: any[]) {
    if (!this.isProduction) {
      console.log(`🔍 ${message}`, ...args);
    }
  }
  
  static success(message: string, ...args: any[]) {
    console.log(`✅ ${message}`, ...args);
  }
  
  static fatal(message: string, ...args: any[]) {
    console.error(`💥 FATAL: ${message}`, ...args);
    process.exit(1);
  }
}