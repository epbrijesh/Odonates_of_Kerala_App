import { Http, ApplicationSettings, Observable } from '@nativescript/core';
import { Odonate } from '../models/odonate.model';

export class SyncService extends Observable {
  private static instance: SyncService;
  private readonly VERSION_KEY = 'odonatesDataVersion';
  private readonly DATA_KEY = 'odonatesData';
  public readonly DATA_URL = 'https://raw.githubusercontent.com/epbrijesh/Odonates_of_Kerala_App/refs/heads/main/app/data/odonates.json';
  public readonly VERSION_URL = 'https://raw.githubusercontent.com/epbrijesh/Odonates_of_Kerala_App/refs/heads/main/app/data/version.json';

  private constructor() {
    super();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  async checkForUpdates(): Promise<boolean> {
    // Always return true to enable force sync
    return true;
  }

  async syncData(): Promise<{ success: boolean; message: string; version?: number }> {
    try {
      // Get the version information first
      const versionResponse = await Http.getString(this.VERSION_URL);
      const versionData = JSON.parse(versionResponse);
      const newVersion = versionData.version;

      // Fetch new data
      const dataResponse = await Http.getString(this.DATA_URL);
      const newData = JSON.parse(dataResponse);

      // Validate data structure
      if (!Array.isArray(newData) || !this.validateOdonatesData(newData)) {
        throw new Error('Invalid data format received');
      }

      // Store new data
      ApplicationSettings.setString(this.DATA_KEY, dataResponse);
      ApplicationSettings.setNumber(this.VERSION_KEY, newVersion);

      return {
        success: true,
        message: 'Data updated successfully!',
        version: newVersion
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        message: 'Failed to sync data. Please check your internet connection and try again.'
      };
    }
  }

  getLocalData(): Odonate[] {
    try {
      const savedData = ApplicationSettings.getString(this.DATA_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error reading local data:', error);
    }
    return null;
  }

  private validateOdonatesData(data: any[]): boolean {
    return data.every(item => 
      typeof item.id === 'number' &&
      typeof item.commonName === 'string' &&
      typeof item.malayalamName === 'string' &&
      typeof item.scientificName === 'string' &&
      typeof item.family === 'string' &&
      typeof item.description1 === 'string' &&
      typeof item.description2 === 'string' &&
      typeof item.description3 === 'string' &&
      typeof item.description4 === 'string' &&
      typeof item.description5 === 'string' &&
      typeof item.mainPhoto === 'string' &&
      Array.isArray(item.photos)
    );
  }
}