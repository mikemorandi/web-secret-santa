import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from '../modules/wichtel/entities/settings.entity';

async function updateDrawingTime() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const settingsModel = app.get<Model<Settings>>(getModelToken(Settings.name));

  try {
    // Set drawing time to December 1st, 2025 at 12:00 (noon) UTC
    const newDrawingTime = new Date('2025-12-01T12:00:00.000Z');

    const result = await settingsModel.updateOne(
      {}, // Update the first settings document
      { $set: { drawing_time: newDrawingTime } }
    ).exec();

    if (result.modifiedCount > 0) {
      console.log(`✓ Drawing time updated successfully to: ${newDrawingTime.toISOString()}`);
      console.log(`  Formatted: ${formatDate(newDrawingTime)}`);
    } else {
      console.log('⚠ No settings document found or drawing time was already set to this value');

      // Check if settings exist
      const settings = await settingsModel.findOne().exec();
      if (settings) {
        console.log(`  Current drawing time: ${settings.drawing_time}`);
      }
    }
  } catch (error) {
    console.error('Error updating drawing time:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes} UTC`;
}

updateDrawingTime();
