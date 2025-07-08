// app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import { TopicsController } from './controller/topics.controller';
import { TopicsService } from './services/topics.service';
import { BooksService } from './services/books.service';
import { StatsController } from './controller/stats.controller';
import { BooksController } from './controller/books.controller';
import { UsersController } from './controller/users.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Topic, TopicSchema } from './schema/topic.schema';
import { Book, BookSchema } from './schema/book.schema';
import { UsersService } from './services/users.service';
import { User, UserSchema } from './schema/user.schema';
import jwtConfig from './common/config/jwt.config';
import { JwtStrategy } from './common/config/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './common/guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        return {
          uri,
          connectionFactory: (connection) => {
            connection.on('connected', () => console.log('MongoDB connected'));
            connection.on('error', (err) =>
              console.error('MongoDB connection error:', err),
            );
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: User.name, schema: UserSchema },
    ]),
    IamModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
      },
    }),
  ],
  controllers: [
    AppController,
    TopicsController,
    StatsController,
    BooksController,
    UsersController,
  ],
  providers: [
    AppService,
    TopicsService,
    BooksService,
    UsersService,
    JwtService,
    JwtStrategy,
    
    /* {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    }, */
  ],
})
export class AppModule {}
