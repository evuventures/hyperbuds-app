import { profileApi } from '../profile.api';
import { apiClient } from '../client';

// Mock the API client
jest.mock('../client', () => ({
   apiClient: {
      get: jest.fn(),
   },
}));

describe('profileApi', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe('getProfileByUsername', () => {
      it('should fetch profile with correct endpoint for username without @', async () => {
         const mockData = { id: '123', username: 'testuser' };
         (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

         const result = await profileApi.getProfileByUsername('testuser');

         expect(apiClient.get).toHaveBeenCalledWith('/update/profile/@testuser');
         expect(result).toEqual(mockData);
      });

      it('should fetch profile with correct endpoint for username with @', async () => {
         const mockData = { id: '123', username: 'testuser' };
         (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

         // Pass username with @ - function should strip it
         const result = await profileApi.getProfileByUsername('@testuser');

         // Expect endpoint to still use @testuser correctly (function adds @ back to endpoint)
         expect(apiClient.get).toHaveBeenCalledWith('/update/profile/@testuser');
         expect(result).toEqual(mockData);
      });

      it('should handle URL encoded @ symbol correctly', async () => {
         const mockData = { id: '123', username: 'testuser' };
         (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

         // Encoded @ is %40
         const result = await profileApi.getProfileByUsername('%40testuser');

         expect(apiClient.get).toHaveBeenCalledWith('/update/profile/@testuser');
         expect(result).toEqual(mockData);
      });

      it('should handle whitespace in username', async () => {
         const mockData = { id: '123', username: 'testuser' };
         (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

         await profileApi.getProfileByUsername('  testuser  ');

         expect(apiClient.get).toHaveBeenCalledWith('/update/profile/@testuser');
      });

      it('should throw error if username is empty', async () => {
         await expect(profileApi.getProfileByUsername('')).rejects.toThrow('Username is required');
         await expect(profileApi.getProfileByUsername('   ')).rejects.toThrow('Username is required');
      });

      it('should handle 404 error (Profile not found)', async () => {
         const error = {
            response: { status: 404 },
            message: 'Request failed with status code 404'
         };
         (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

         await expect(profileApi.getProfileByUsername('nonexistent')).rejects.toThrow('Profile not found');
      });

      it('should handle 400 error (Invalid username)', async () => {
         const error = {
            response: { status: 400 },
            message: 'Request failed with status code 400'
         };
         (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

         await expect(profileApi.getProfileByUsername('invalid')).rejects.toThrow('Username is missing or invalid');
      });

      it('should handle generic API errors', async () => {
         const error = new Error('Network error');
         (apiClient.get as jest.Mock).mockRejectedValueOnce(error);

         await expect(profileApi.getProfileByUsername('testuser')).rejects.toThrow('Network error');
      });
   });
});
