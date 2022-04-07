import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ValidationPipe } from '@nestjs/common'

import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    const configService = app.get(ConfigService)
    const port = configService.get('PORT')

    app.useGlobalPipes(new ValidationPipe({
        errorHttpStatusCode: 406
    }))

    await app.listen(port, () => console.log(`Server has been started on port ${port}`))
}

bootstrap()