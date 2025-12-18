import dotenv from 'dotenv/config';
import { connectDatabase } from '../config/database.js';
import Canteen from '../models/Canteen.js';

// High-quality canteen/food banner images from Unsplash
const canteenImages = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=400&fit=crop&q=85',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&h=400&fit=crop&q=85',
];

async function updateCanteenImages() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await connectDatabase();

        const canteens = await Canteen.find({});
        console.log(`📊 Found ${canteens.length} canteens`);

        let updatedCount = 0;
        let skippedCount = 0;

        for (let i = 0; i < canteens.length; i++) {
            const canteen = canteens[i];

            if (canteen.image) {
                console.log(`⏭️  Skipping "${canteen.name}" - already has image`);
                skippedCount++;
                continue;
            }

            const imageUrl = canteenImages[i % canteenImages.length];
            canteen.image = imageUrl;

            await canteen.save();
            console.log(`✅ Updated "${canteen.name}" with image ${i % canteenImages.length + 1}`);
            updatedCount++;
        }

        console.log('\n📈 Summary:');
        console.log(`   ✅ Updated: ${updatedCount} canteens`);
        console.log(`   ⏭️  Skipped: ${skippedCount} canteens`);
        console.log(`   📊 Total: ${canteens.length} canteens`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateCanteenImages();
