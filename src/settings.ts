import * as dotenv from 'dotenv'

dotenv.config()

interface Settings {
    [key: string]: string | boolean | undefined
}

const defaultSettings: Settings = {
    provider: 'GOOGLE',
    skipPackageIfTestsExists: true
}

export const settings: Settings = {...process.env, ...defaultSettings}