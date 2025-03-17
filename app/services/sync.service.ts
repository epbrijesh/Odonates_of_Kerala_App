import { Http, ApplicationSettings, Observable, File, Folder, knownFolders } from '@nativescript/core';
import { Species } from '../models/species.model';

export interface ProgressCallback {
  (progress: { current: number; total: number }): void;
}

export class SyncService extends Observable {
  private static instance: SyncService;
  private readonly VERSION_KEY = 'speciesDataVersion';
  private readonly DATA_KEY = 'speciesData';
  private readonly IMAGES_VERSION_KEY = 'speciesImagesVersion';
  public readonly DATA_URL = 'https://raw.githubusercontent.com/epbrijesh/Odonates_of_Kerala_App/main/app/data/app_data.json';
  public readonly VERSION_URL = 'https://raw.githubusercontent.com/epbrijesh/Odonates_of_Kerala_App/main/app/data/version.json';
  public readonly IMAGES_BASE_URL = 'https://raw.githubusercontent.com/epbrijesh/Odonates_of_Kerala_App/main/app/images/';

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
    return true;
  }

  async syncData(): Promise<{ success: boolean; message: string; version?: number }> {
    try {
      const versionResponse = await Http.getString(this.VERSION_URL);
      const versionData = JSON.parse(versionResponse);
      const newVersion = versionData.version;

      const dataResponse = await Http.getString(this.DATA_URL);
      const newData = JSON.parse(dataResponse);

      if (!Array.isArray(newData) || !this.validateSpeciesData(newData)) {
        throw new Error('Invalid data format received');
      }

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

  async syncImages(progressCallback?: ProgressCallback): Promise<{ success: boolean; message: string }> {
    try {
      const speciesList = this.getLocalData();
      if (!speciesList) {
        return {
          success: false,
          message: 'No species data available. Please sync data first.'
        };
      }

      const imagesFolder = knownFolders.currentApp().getFolder('images');
      if (!imagesFolder) {
        return {
          success: false,
          message: 'Failed to access images folder.'
        };
      }

      const imageUrls = new Set<string>();
      speciesList.forEach(species => {
        const mainPhotoFilename = species.mainPhoto.split('/').pop();
        if (mainPhotoFilename) {
          imageUrls.add(mainPhotoFilename);
        }
        species.photos.forEach(photo => {
          const photoFilename = photo.url.split('/').pop();
          if (photoFilename) {
            imageUrls.add(photoFilename);
          }
        });
      });

      let downloadedCount = 0;
      const totalImages = imageUrls.size;

      for (const imageFilename of imageUrls) {
        try {
          const imageUrl = this.IMAGES_BASE_URL + imageFilename;
          const imagePath = imagesFolder.path + '/' + imageFilename;
          
          if (File.exists(imagePath)) {
            File.fromPath(imagePath).remove();
          }
          
          const downloaded = await Http.getFile(imageUrl, imagePath);
          
          if (downloaded) {
            downloadedCount++;
            if (progressCallback) {
              progressCallback({ current: downloadedCount, total: totalImages });
            }
          } else {
            console.error(`Failed to download image ${imageFilename}`);
          }
        } catch (error) {
          console.error(`Failed to download image ${imageFilename}:`, error);
        }
      }

      if (downloadedCount === 0) {
        return {
          success: false,
          message: 'Failed to download any images. Please check your internet connection.'
        };
      }

      return {
        success: true,
        message: `Successfully downloaded ${downloadedCount} of ${totalImages} images. Please restart the app to see the updated images.`
      };
    } catch (error) {
      console.error('Image sync error:', error);
      return {
        success: false,
        message: 'Failed to sync images. Please check your internet connection and try again.'
      };
    }
  }

  getLocalData(): Species[] {
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

  private validateSpeciesData(data: any[]): boolean {
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