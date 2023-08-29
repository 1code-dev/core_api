import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TracksModule } from './tracks/tracks.module';
import { ExercisesModule } from './exercises/exercises.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [UsersModule, TracksModule, ExercisesModule, LeaderboardModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
