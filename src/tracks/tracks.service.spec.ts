import { Test, TestingModule } from '@nestjs/testing';
import { TracksService } from './tracks.service';

describe('TracksService', () => {
  let service: TracksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracksService],
    }).compile();

    service = module.get<TracksService>(TracksService);
  });

  // Check if `fetchAllAvailableTracks` function returning track list properly
  it('should return a valid count', async () => {
    const tracks = await service.fetchAllAvailableTracks();

    // except length to be greater then 0
    expect(tracks.length).toBeGreaterThan(0);

    // validate format of the response
    expect(tracks[0].id).not.toBeNull();
    expect(tracks[0].logo).not.toBeNull();
    expect(tracks[0].name).not.toBeNull();
    expect(tracks[0].tags).not.toBeNull();

    // Validate if tags are being fetched properly
    expect(tracks[0].tags.length).toBeGreaterThan(0);
  });
});
